import { useCallback, useMemo, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectDocument } from '../store/selectors';
import { setDocumentValue } from '../store/documentSlice';

/**
 * useDocumentForm — bridge between Redux-backed document state and the
 * Phase 3 validation engine (`src/forms/validation.js`).
 *
 * Henry's documents are stored as `{ section: { field: value } }`; the
 * validation schema talks in flat `'section.field'` paths so consumers can
 * write rules without nesting:
 *
 *   const schema = defineSchema({
 *     'tenant.email':   [required(), email()],
 *     'property.unit':  [required(), maxLen(40)],
 *   });
 *   const form = useDocumentForm({ schema });
 *   form.fieldProps('tenant.email')  // → { value, onChange, onBlur, error }
 *   form.validate()                  // → { isValid, errors, firstErrorPath }
 *
 * What this hook owns (locally, not in Redux):
 *   - `touched`     map of paths the user has interacted with (blurred)
 *   - `dirty`       map of paths the user has changed since mount
 *   - `submitted`   flag; flipped true on submit() or validate({force:true})
 *   - `isSubmitting` flag, toggled by setSubmitting(bool)
 *
 * What lives in Redux (untouched):
 *   - The document values themselves (single source of truth so the print
 *     preview, archive, audit log all stay coherent).
 *
 * Why local state for touched/dirty/submitting:
 *   Per-form ephemeral UX state has no business in Redux. It would also
 *   collide if two `useDocumentForm` mounts existed; keeping it local makes
 *   the hook trivially reusable.
 */

// ────────────────────────────── reducer ──────────────────────────────

const initialMeta = {
  touched: {},
  dirty: {},
  submitted: false,
  isSubmitting: false,
};

function metaReducer(state, action) {
  switch (action.type) {
    case 'TOUCH':
      if (state.touched[action.path]) return state;
      return { ...state, touched: { ...state.touched, [action.path]: true } };
    case 'DIRTY':
      if (state.dirty[action.path]) return state;
      return { ...state, dirty: { ...state.dirty, [action.path]: true } };
    case 'SUBMIT_START':
      return { ...state, submitted: true, isSubmitting: true };
    case 'SUBMIT_END':
      return { ...state, isSubmitting: false };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: Boolean(action.value) };
    case 'MARK_SUBMITTED':
      return { ...state, submitted: true };
    case 'RESET':
      return initialMeta;
    default:
      return state;
  }
}

// ────────────────────────── path helpers ────────────────────────────

const splitPath = (path) => {
  const dot = path.indexOf('.');
  if (dot === -1) {
    throw new Error(`useDocumentForm: field path "${path}" must be "section.field"`);
  }
  return [path.slice(0, dot), path.slice(dot + 1)];
};

const readPath = (doc, path) => {
  const [section, field] = splitPath(path);
  return doc?.[section]?.[field];
};

// ─────────────────────────── flatten doc ────────────────────────────

/**
 * Flatten `{section: {field: v}}` into `{'section.field': v}` so the
 * validation engine (which keys errors by path) can run against it.
 *
 * Memoized per-render via useMemo in the hook to avoid spurious work.
 */
const flatten = (doc, paths) => {
  const out = {};
  for (const path of paths) {
    out[path] = readPath(doc, path);
  }
  return out;
};

// ─────────────────────────────── hook ───────────────────────────────

export function useDocumentForm({ schema }) {
  if (!schema || typeof schema.validate !== 'function') {
    throw new Error('useDocumentForm: { schema } must be a defineSchema() instance');
  }

  const dispatch = useDispatch();
  const doc = useSelector(selectDocument);
  const [meta, metaDispatch] = useReducer(metaReducer, initialMeta);

  // Schema field paths are stable for the lifetime of a Schema instance,
  // so derive once and keep the array reference if the schema didn't change.
  const paths = useMemo(() => Object.keys(schema.spec), [schema]);

  // Flat values snapshot — the shape the validator wants. Recomputed each
  // render but cheap (linear in path count, ~30 entries max).
  const values = useMemo(() => flatten(doc, paths), [doc, paths]);

  // Run the schema against the current values.
  const { errors, isValid } = useMemo(() => schema.validate(values), [schema, values]);

  // First error path in schema-declaration order — what `submit()` should
  // scroll/focus to. Returns null when the form is valid.
  const firstErrorPath = useMemo(() => {
    for (const path of paths) {
      if (errors[path]) return path;
    }
    return null;
  }, [paths, errors]);

  // ──────────── visible errors ────────────
  // We only surface an error to the UI once the user has touched the field
  // OR submission has been attempted. This prevents the "screaming form"
  // anti-pattern where every field shows red on first paint.
  const visibleErrors = useMemo(() => {
    const out = {};
    for (const path of paths) {
      if (!errors[path]) continue;
      if (meta.submitted || meta.touched[path]) out[path] = errors[path];
    }
    return out;
  }, [errors, meta.submitted, meta.touched, paths]);

  // ──────────── setValue ────────────
  // Coerces `''` → undefined for required-rule consistency? No — keep raw
  // strings so consumers can render `value={''}` without React warnings.
  // Numbers are NOT auto-parsed: that's the rule's job (number()/min/max).
  const setValue = useCallback(
    (path, value) => {
      const [section, field] = splitPath(path);
      dispatch(setDocumentValue({ section, field, value }));
      metaDispatch({ type: 'DIRTY', path });
    },
    [dispatch],
  );

  // ──────────── fieldProps ────────────
  // Spread-ready object for `<Input {...form.fieldProps('tenant.email')} />`.
  // Maps onChange to extract `event.target.value` (works for Input/Textarea/
  // Select). Pass `extract: (e) => e.target.checked` to override for
  // Checkbox/Radio. Includes `error` only when visible.
  const fieldProps = useCallback(
    (path, { extract } = {}) => {
      const value = values[path];
      return {
        value: value ?? '',
        onChange: (eventOrValue) => {
          const v = extract
            ? extract(eventOrValue)
            : eventOrValue?.target !== undefined
              ? eventOrValue.target.value
              : eventOrValue;
          setValue(path, v);
        },
        onBlur: () => metaDispatch({ type: 'TOUCH', path }),
        error: visibleErrors[path],
        // FormField reads required/invalid from these via context too:
        'aria-invalid': visibleErrors[path] ? true : undefined,
      };
    },
    [values, visibleErrors, setValue],
  );

  // ──────────── validate / submit ────────────
  // `validate({ force: true })` flips submitted=true so all errors become
  // visible (call this from a "Validate" button). `submit(handler)` runs
  // the handler only when isValid, with isSubmitting toggled around it.
  const validate = useCallback(
    ({ force = false } = {}) => {
      if (force) metaDispatch({ type: 'MARK_SUBMITTED' });
      return { isValid, errors, firstErrorPath };
    },
    [isValid, errors, firstErrorPath],
  );

  const submit = useCallback(
    async (handler) => {
      metaDispatch({ type: 'SUBMIT_START' });
      try {
        if (!isValid) {
          return { isValid: false, errors, firstErrorPath };
        }
        const result = await handler?.(values);
        return { isValid: true, errors: {}, firstErrorPath: null, result };
      } finally {
        metaDispatch({ type: 'SUBMIT_END' });
      }
    },
    [isValid, errors, firstErrorPath, values],
  );

  const setSubmitting = useCallback((value) => metaDispatch({ type: 'SET_SUBMITTING', value }), []);

  const reset = useCallback(() => metaDispatch({ type: 'RESET' }), []);

  return {
    // values + derived
    values,
    errors, // raw (every failing rule)
    visibleErrors, // filtered by touched/submitted — what the UI should show
    isValid,
    firstErrorPath,
    // meta state
    touched: meta.touched,
    dirty: meta.dirty,
    submitted: meta.submitted,
    isSubmitting: meta.isSubmitting,
    // actions
    setValue,
    fieldProps,
    validate,
    submit,
    setSubmitting,
    reset,
  };
}

export default useDocumentForm;
