import React from 'react';
import clsx from './clsx';

/**
 * EmptyState — friendly placeholder for empty lists / zero-data screens.
 *
 * Usage:
 *   <EmptyState
 *     icon="📭"
 *     title="No documents yet"
 *     description="Generated documents will appear here."
 *     action={<Button variant="primary">Create document</Button>}
 *   />
 */
export default function EmptyState({ icon, title, description, action, className, ...rest }) {
  return (
    <div className={clsx('ui-empty', className)} role="status" {...rest}>
      {icon && (
        <div className="ui-empty__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      {title && <h3 className="ui-empty__title">{title}</h3>}
      {description && <p className="ui-empty__desc">{description}</p>}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  );
}
