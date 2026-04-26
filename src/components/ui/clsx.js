/**
 * Tiny classnames helper. Avoids pulling in the `clsx` npm package
 * (we deliberately ship zero new runtime deps in the Phase-2 batch).
 *
 * Accepts strings, falsy values, and plain objects (`{ 'is-active': true }`).
 */
export default function clsx(...args) {
  const out = [];
  for (const a of args) {
    if (!a) continue;
    if (typeof a === 'string' || typeof a === 'number') {
      out.push(a);
    } else if (Array.isArray(a)) {
      const inner = clsx(...a);
      if (inner) out.push(inner);
    } else if (typeof a === 'object') {
      for (const [k, v] of Object.entries(a)) {
        if (v) out.push(k);
      }
    }
  }
  return out.join(' ');
}
