import React from 'react';
import PrintButton from './PrintButton';

const FooterActionBar = () => (
  <footer className="footer-action-bar print-hidden" role="contentinfo" aria-label="Document footer actions">
    <div className="footer-action-bar__actions">
      <PrintButton />
    </div>
  </footer>
);

export default React.memo(FooterActionBar);
