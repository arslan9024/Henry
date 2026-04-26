import React from 'react';
import DocumentSelector from './DocumentSelector';
import HenryOperationsPanel from './HenryOperationsPanel';
import IdentityScanner from './IdentityScanner';
import Disclosure from './Disclosure';
import { useSidebarContent } from '../hooks/useSidebarContent';

const InfoArticlesPanel = () => {
  const { activeTemplateLabel, highlights, articles, lastUpdated } = useSidebarContent();

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
