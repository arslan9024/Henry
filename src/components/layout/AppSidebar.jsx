import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  goToDocumentHub,
  goToEmiratesId,
  goToPayroll,
  goToTenantIdentityDocs,
  goToTenancyBuilder,
  goToTitleDeed,
  selectCurrentPage,
} from '../../store/appRouteSlice';
import { selectLeftRail, toggleLeftRail } from '../../store/uiCommandSlice';

const NAV_ITEMS = [
  { key: 'documentHub', label: 'Document Hub', icon: '📄', action: goToDocumentHub },
  { key: 'tenancyBuilder', label: 'Tenancy Builder', icon: '🧩', action: goToTenancyBuilder },
  { key: 'tenantIdentityDocs', label: 'Tenant Identity', icon: '🛂', action: goToTenantIdentityDocs },
  { key: 'titleDeed', label: 'Title Deed', icon: '🏷️', action: goToTitleDeed },
  { key: 'emiratesId', label: 'Emirates ID', icon: '🪪', action: goToEmiratesId },
  { key: 'payroll', label: 'Payroll', icon: '💳', action: goToPayroll },
];

const AppSidebar = () => {
  const dispatch = useDispatch();
  const currentPage = useSelector(selectCurrentPage);
  const leftRail = useSelector(selectLeftRail);
  const collapsed = leftRail === 'collapsed';

  const title = useMemo(() => {
    const match = NAV_ITEMS.find((item) => item.key === currentPage);
    return match?.label || 'Workspace';
  }, [currentPage]);

  return (
    <aside
      className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}
      aria-label="Primary navigation sidebar"
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
        {NAV_ITEMS.map((item) => {
          const active = item.key === currentPage;
          return (
            <button
              key={item.key}
              type="button"
              className={`app-sidebar__nav-item ${active ? 'is-active' : ''}`}
              onClick={() => dispatch(item.action())}
              aria-current={active ? 'page' : undefined}
              title={item.label}
            >
              <span aria-hidden="true">{item.icon}</span>
              {!collapsed ? <span>{item.label}</span> : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AppSidebar;
