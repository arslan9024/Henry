import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTemplate } from '../store/templateSlice';
import { selectActiveTemplate, selectActiveTemplateLabel } from '../store/selectors';

export const useActiveTemplate = () => {
  const dispatch = useDispatch();
  const activeTemplate = useSelector(selectActiveTemplate);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);

  const onChangeTemplate = useCallback(
    (templateKey) => {
      dispatch(setActiveTemplate(templateKey));
    },
    [dispatch],
  );

  return {
    activeTemplate,
    activeTemplateLabel,
    onChangeTemplate,
  };
};
