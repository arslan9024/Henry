import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { APP_PAGE_NAV_ITEMS, navigateToPage, selectCurrentPage } from '../../store/appRouteSlice';
import {
  closeCommandPalette,
  closeDrawer,
  closePreview,
  selectLeftRail,
  toggleLeftRail,
} from '../../store/uiCommandSlice';

const AppSidebar = () => {
  const dispatch = useDispatch();
  const currentPage = useSelector(selectCurrentPage);
  const leftRail = useSelector(selectLeftRail);
  const collapsed = leftRail === 'collapsed';

  const title = useMemo(() => {
    const match = APP_PAGE_NAV_ITEMS.find((item) => item.key === currentPage);
    return match?.label || 'Workspace';
  }, [currentPage]);

  const handleNavigate = (targetPage) => {
    dispatch(navigateToPage(targetPage));
    dispatch(closeDrawer());
    dispatch(closePreview());
    dispatch(closeCommandPalette());
  };

  return (
    <aside
      className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}
      aria-label="Primary navigation sidebar"
      aria-expanded={!collapsed}
    >
      <div className="app-sidebar__header">
        <button
          type="button"
          className="app-sidebar__toggle"
          onClick={() => dispatch(toggleLeftRail())}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '»' : '«'}
        </button>
        {!collapsed ? (
          <div className="app-sidebar__header-copy">
            <h2>Henry Workspace</h2>
            <p>{title}</p>
          </div>
        ) : null}
      </div>

      <nav className="app-sidebar__nav" aria-label="Module navigation">
        {APP_PAGE_NAV_ITEMS.map((item) => {
          const active = item.key === currentPage;
          return (
            <button
              key={item.key}
              type="button"
              className={`app-sidebar__nav-item ${active ? 'is-active' : ''}`}
              onClick={() => handleNavigate(item.key)}
              aria-current={active ? 'page' : undefined}
              title={item.label}
            >
              <span className="app-sidebar__nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {!collapsed ? <span>{item.label}</span> : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AppSidebar;
