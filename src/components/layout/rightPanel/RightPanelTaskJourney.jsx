/**
 * [Category 1: View]
 * White Caves Real Estate - Right Panel Task Journey & Verification Card
 * Displays real-time task journey activities, checks, completions, and pending actions (< 95 lines).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentStep } from '../../../store/tenancyStudioSlice';

export const RightPanelTaskJourney = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector((state) => state.tenancyStudio?.currentStep || 1);
  const page1 = useSelector((state) => state.tenancyStudio?.page1 || {});
  const chequeCount = useSelector((state) => state.tenancyStudio?.chequeCount || 4);

  const isP1Complete = Boolean(
    page1.tenant_name && page1.owner_name && page1.date_from && page1.date_to && page1.annual_rent,
  );

  const journeyTasks = [
    { id: 1, step: 1, name: 'Tenancy Contract 24 DLD Fields', done: isP1Complete },
    { id: 2, step: 1, name: 'Special Terms (5 DLD Clauses)', done: true },
    { id: 3, step: 2, name: 'RERA Statutory Addendum (3 Pgs)', done: true },
    { id: 4, step: 3, name: `Cheque Schedule (${chequeCount} PDCs)`, done: Boolean(page1.annual_rent) },
    { id: 5, step: 3, name: 'VAT Official Payment Receipt', done: Boolean(page1.annual_rent) },
    { id: 6, step: 4, name: 'Client Handover Checklist', done: isP1Complete },
  ];

  const completedCount = journeyTasks.filter((t) => t.done).length;
  const pendingCount = journeyTasks.length - completedCount;

  return (
    <div className="right-panel__section-card">
      <div className="right-panel__section-header">
        <span>Task Journey &amp; Activities</span>
        <span className="right-panel__phase-tag">Phase {currentStep} of 4</span>
      </div>

      <div className="right-panel__stats-row">
        <span className="right-panel__badge-done">✓ {completedCount} Completed</span>
        <span className="right-panel__badge-pending">⏳ {pendingCount} Pending</span>
      </div>

      <div className="right-panel__task-list">
        {journeyTasks.map((task) => (
          <button
            key={task.id}
            type="button"
            className={`right-panel__task-item ${task.done ? 'is-done' : 'is-pending'}`}
            onClick={() => dispatch(setCurrentStep(task.step))}
            title={`Click to jump to Step ${task.step}`}
          >
            <span className="right-panel__task-icon">{task.done ? '✓' : '○'}</span>
            <span className="right-panel__task-text">{task.name}</span>
            <span className="right-panel__step-tag">Step {task.step}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RightPanelTaskJourney);
