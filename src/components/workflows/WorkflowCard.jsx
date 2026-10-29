/**
 * [Category 1: View]
 * White Caves Real Estate - Workflow Blueprint Card (WorkflowCard.jsx)
 * Clean single-purpose presentation component (< 85 lines, zero inline CSS).
 */

import React from 'react';

export const WorkflowCard = ({ flowchart, onSelect }) => {
  return (
    <div className="workflow-card" onClick={() => onSelect(flowchart)}>
      <div className="workflow-card__header">
        <span className="workflow-card__category">{flowchart.category}</span>
        <span className="workflow-card__badge">{flowchart.badge}</span>
      </div>

      <h3 className="workflow-card__title">{flowchart.title}</h3>
      <p className="workflow-card__summary">{flowchart.summary}</p>

      <div className="workflow-card__stages">
        {flowchart.stages.map((stg, i) => (
          <span key={i} className="workflow-card__stage-pill">
            {i + 1}. {stg}
          </span>
        ))}
      </div>

      <div className="workflow-card__footer">
        <button
          type="button"
          className="workflow-card__inspect-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(flowchart);
          }}
          title={`Open ${flowchart.title} blueprint`}
        >
          🔍 Inspect Blueprint
        </button>
      </div>
    </div>
  );
};

export default React.memo(WorkflowCard);
