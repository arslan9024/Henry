import { useSelector } from 'react-redux';
import { selectActiveTemplateLabel, selectSidebarContent, selectSidebarState } from '../store/selectors';

export const useSidebarContent = () => {
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
  const sidebarContent = useSelector(selectSidebarContent);
  const sidebarState = useSelector(selectSidebarState);

  return {
    activeTemplateLabel,
    highlights: sidebarContent.highlights,
    articles: sidebarContent.articles,
    lastUpdated: sidebarState.lastUpdated,
  };
};
