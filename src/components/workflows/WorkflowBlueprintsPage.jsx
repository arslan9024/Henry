/**
 * [Category 1: View]
 * White Caves Real Estate - Workflow Blueprints & Architecture Explorer
 * Master interactive explorer for all 8 system flowcharts (< 115 lines, zero inline CSS).
 */

import React, { useState } from 'react';
import { WORKFLOW_FLOWCHARTS } from '../../assets/flowcharts/flowchartsData';
import WorkflowCard from './WorkflowCard';
import WorkflowViewerModal from './WorkflowViewerModal';

const CATEGORIES = [
  'All',
  'Leasing Workflows',
  'Identity & OCR',
  'Property Verification',
  'Human Resources',
  'Storage & Audit',
  'System Architecture',
];

export const WorkflowBlueprintsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeFlowchart, setActiveFlowchart] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = WORKFLOW_FLOWCHARTS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <main className="workflows-page" aria-label="System Workflows & Flowchart Explorer">
      <header className="workflows-page__header">
        <div className="workflows-page__header-copy">
          <span className="workflows-page__pretitle">White Caves Real Estate · System Blueprints</span>
          <h1 className="workflows-page__title">Enterprise Workflows &amp; Flowcharts</h1>
          <p className="workflows-page__subtitle">
            Visual architectural maps covering all end-to-end scenarios, 5-way file isolation, and statutory
            RERA gates.
          </p>
        </div>

        <div className="workflows-page__search-wrap">
          <input
            type="search"
            className="workflows-page__search-input"
            placeholder="Search flowcharts & scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter flowcharts"
          />
        </div>
      </header>

      <nav className="workflows-page__filter-bar" aria-label="Filter by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`workflows-page__cat-btn ${selectedCategory === cat ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      <section className="workflows-page__grid" aria-label="Workflow Blueprints Grid">
        {filtered.map((item) => (
          <WorkflowCard key={item.id} flowchart={item} onSelect={setActiveFlowchart} />
        ))}
      </section>

      <WorkflowViewerModal flowchart={activeFlowchart} onClose={() => setActiveFlowchart(null)} />
    </main>
  );
};

export default WorkflowBlueprintsPage;
