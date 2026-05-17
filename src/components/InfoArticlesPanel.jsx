import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentSelector from './DocumentSelector';
import HenryOperationsPanel from './HenryOperationsPanel';
import IdentityScanner from './IdentityScanner';
import Disclosure from './Disclosure';
import { useSidebarContent } from '../hooks/useSidebarContent';
import { selectCanGeneratePdf } from '../store/selectors';

const InfoArticlesPanel = () => {
  const { activeTemplateLabel, highlights, articles, lastUpdated } = useSidebarContent();
  const canGeneratePdf = useSelector(selectCanGeneratePdf);
  const activeTemplate = useSelector((state) => state.template.activeTemplate);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');

  const handleBlankDownload = async () => {
    try {
      setDownloading(true);
      setDlError('');
      const { downloadBlankTemplate } = await import('../pdf/generateQuotationPdf');
      await downloadBlankTemplate(activeTemplate);
    } catch (err) {
      setDlError(err?.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <aside className="info-articles-panel print-hidden" aria-label="Henry's guidance sidebar">
      <div className="henry-sidebar-header">
        <span className="henry-sidebar-header__avatar" aria-hidden="true">
          🤵
        </span>
        <div>
          <h3 className="henry-sidebar-header__title">Henry's Guidance</h3>
          <p className="henry-sidebar-header__sub">The Record Keeper · WC-AI-003</p>
        </div>
      </div>

      <p className="policy-meta">Active document: {activeTemplateLabel}</p>
      <p className="policy-meta">Guidance updated: {lastUpdated}</p>

      <Disclosure title="Templates" icon="📄" defaultOpen>
        <DocumentSelector />
        {canGeneratePdf && (
          <div className="blank-dl-wrap">
            <button
              type="button"
              className="blank-download-btn"
              onClick={handleBlankDownload}
              disabled={downloading}
              title="Download an empty, unsigned version of this template for staff"
              aria-label="Download blank template"
            >
              {downloading ? '⏳ Preparing…' : '⬇ Download Blank Template'}
            </button>
            {dlError && <p className="blank-download-error">{dlError}</p>}
          </div>
        )}
      </Disclosure>

      <Disclosure title="Operations" icon="⚙️">
        <HenryOperationsPanel />
      </Disclosure>

      <Disclosure title="Identity Scanner" icon="🪪">
        <IdentityScanner />
      </Disclosure>

      <Disclosure title="Filing Highlights" icon="💡" badge={highlights.length || null}>
        <div className="highlight-list" role="list" aria-label="Key filing highlights">
          {highlights.map((item, idx) => (
            <p className="highlight-item" key={`${item}-${idx}`}>
              {item}
            </p>
          ))}
        </div>
      </Disclosure>

      <Disclosure title="Guidance Articles" icon="📚" badge={articles.length || null}>
        <div className="article-list" role="list" aria-label="Henry's document guidance articles">
          {articles.map((article) => (
            <article className="article-card" key={article.title}>
              <h4>{article.title}</h4>
              <p>{article.text}</p>
            </article>
          ))}
        </div>
      </Disclosure>
    </aside>
  );
};

export default React.memo(InfoArticlesPanel);
