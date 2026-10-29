/**
 * [Category 1: View]
 * White Caves Real Estate - Workflow Fullscreen Viewer Modal
 * High-resolution vector diagram inspection & stage checklist (< 85 lines, zero inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useModalA11y } from '../../hooks/useModalA11y';

export const WorkflowViewerModal = ({ flowchart, onClose }) => {
  const trapRef = useModalA11y(Boolean(flowchart), onClose);

  if (!flowchart) return null;

  return (
    <>
      <div className="workflow-modal__backdrop" onClick={onClose} aria-label="Close modal" />
      <div
        ref={trapRef}
        className="workflow-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={flowchart.title}
      >
        <div className="workflow-modal__header">
          <div>
            <div className="workflow-modal__prehead">
              <span>{flowchart.category}</span> ·{' '}
              <span className="workflow-card__badge">{flowchart.badge}</span>
            </div>
            <h2 className="workflow-modal__title">{flowchart.title}</h2>
          </div>
          <button
            type="button"
            className="workflow-modal__close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="workflow-modal__body">
          <p className="workflow-modal__desc">{flowchart.summary}</p>

          <div className="workflow-modal__diagram-frame">
            <img
              src={`/assets/workflows/${flowchart.filename}`}
              alt={flowchart.title}
              className="workflow-modal__diagram-img"
              loading="lazy"
            />
          </div>

          <div className="workflow-modal__stages-wrap">
            <h4 className="workflow-modal__stages-title">Execution Sequence:</h4>
            <ol className="workflow-modal__stages-list">
              {flowchart.stages.map((stg, i) => (
                <li key={i}>{stg}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="workflow-modal__footer">
          <button type="button" className="workflow-modal__action-btn" onClick={onClose}>
            Done Inspecting
          </button>
        </div>
      </div>
    </>
  );
};

WorkflowViewerModal.propTypes = {
  flowchart: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default WorkflowViewerModal;
