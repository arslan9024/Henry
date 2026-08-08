import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { navigateToPage } from '../store/appRouteSlice';
import { closeCommandPalette, closeDrawer, closePreview } from '../store/uiCommandSlice';

const useAppNavigation = () => {
  const dispatch = useDispatch();

  const goToPage = useCallback(
    (targetPage, context = null) => {
      dispatch(navigateToPage(context ? { page: targetPage, context } : targetPage));
      dispatch(closeDrawer());
      dispatch(closePreview());
      dispatch(closeCommandPalette());
    },
    [dispatch],
  );

  return { goToPage };
};

export default useAppNavigation;
