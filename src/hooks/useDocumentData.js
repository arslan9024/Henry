import { useSelector } from 'react-redux';
import { selectDocument } from '../store/selectors';

export const useDocumentData = () => {
  return useSelector(selectDocument);
};
