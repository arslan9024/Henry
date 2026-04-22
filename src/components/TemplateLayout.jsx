import React from 'react';

const TemplateLayout = ({ title, children }) => {
  return (
    <section className="doc-shell">
      <div className="doc-page">
        {title ? <h2 className="doc-title">{title}</h2> : null}
        {children}
      </div>
    </section>
  );
};

export default TemplateLayout;
