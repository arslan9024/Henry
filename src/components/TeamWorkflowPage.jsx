import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addAuditLog } from '../store/auditSlice';
import { reviewApproval, selectApprovalRequests, submitApproval } from '../store/approvalSlice';
import { ROLE_PERMISSIONS, selectCurrentUser, setDemoRole } from '../store/userAccessSlice';
import {
  createTenancyTemplateVersion,
  loadTenancyTemplates,
  rollbackTenancyTemplateVersion,
} from '../records/templateStore';
import { getCloudPersistenceConfig } from '../services/cloudPersistenceService';
import { Badge, Button, Card, FormField, Input, Select } from './ui';

const TeamWorkflowPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const approvals = useSelector(selectApprovalRequests);
  const [templates, setTemplates] = useState(() => loadTenancyTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [profileLabel, setProfileLabel] = useState('Standard');
  const storage = getCloudPersistenceConfig();
  const canReview = ROLE_PERMISSIONS[user.role].includes('approval.review');
  const canVersion = ROLE_PERMISSIONS[user.role].includes('template.version');
  const workingCopies = templates.filter((item) => item.kind === 'working-copy');
  const versions = templates.filter((item) => item.kind === 'version');

  const submitCurrent = () => {
    dispatch(
      submitApproval({
        recordId: 'active-tenancy-record',
        submittedBy: user.id,
        comment: 'Ready for compliance review.',
      }),
    );
    dispatch(
      addAuditLog({
        type: 'APPROVAL_SUBMITTED',
        timestamp: new Date().toISOString(),
        recordId: 'active-tenancy-record',
        actor: user.id,
      }),
    );
  };

  const decide = (id, decision) => {
    dispatch(reviewApproval({ id, decision, reviewer: user.id, role: user.role }));
    dispatch(
      addAuditLog({
        type: 'APPROVAL_REVIEWED',
        timestamp: new Date().toISOString(),
        approvalId: id,
        decision,
        actor: user.id,
      }),
    );
  };

  const createVersion = () => {
    const result = createTenancyTemplateVersion({
      templateId: selectedTemplateId,
      label: profileLabel,
      createdBy: user.displayName,
    });
    if (result.ok) setTemplates(loadTenancyTemplates());
  };

  const rollback = (version) => {
    const result = rollbackTenancyTemplateVersion({
      workingCopyId: version.parentTemplateId,
      versionId: version.id,
    });
    if (result.ok) setTemplates(loadTenancyTemplates());
  };

  return (
    <main className="workflow-page shell-page" id="main" tabIndex={-1}>
      <section className="workflow-page__header">
        <div className="workflow-page__header-copy">
          <h2>Team Workflow</h2>
          <p>Access, approvals, cloud readiness, and template versions.</p>
        </div>
      </section>
      <section className="validation-dashboard-grid">
        <Card variant="outlined">
          <Card.Header>
            <h3>Identity & access</h3>
            <Badge tone="success">{user.role}</Badge>
          </Card.Header>
          <Card.Body>
            <FormField label="Active role (local fallback)">
              <Select
                value={user.role}
                onChange={(event) => dispatch(setDemoRole(event.target.value))}
                options={['operator', 'manager', 'admin'].map((role) => ({ value: role, label: role }))}
              />
            </FormField>
            <p>{ROLE_PERMISSIONS[user.role].join(' · ')}</p>
            <p>
              <strong>Storage:</strong> {storage.provider}
              {storage.provider === 'firebase' && !storage.firebaseBucket ? ' (configuration required)' : ''}
            </p>
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Header>
            <h3>Approval queue</h3>
            <Badge>{approvals.length}</Badge>
          </Card.Header>
          <Card.Body>
            <Button onClick={submitCurrent}>Submit active record</Button>
            {approvals.map((request) => (
              <div className="tenancy-template-meta" key={request.id}>
                <p>
                  <strong>{request.recordId}</strong> · {request.status}
                </p>
                {request.status === 'pending-manager' ? (
                  <div className="tenancy-gate-actions">
                    <Button size="sm" disabled={!canReview} onClick={() => decide(request.id, 'approved')}>
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!canReview}
                      onClick={() => decide(request.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </Card.Body>
        </Card>
        <Card variant="outlined">
          <Card.Header>
            <h3>Template profiles & versions</h3>
            <Badge>{versions.length}</Badge>
          </Card.Header>
          <Card.Body>
            <FormField label="Working copy">
              <Select
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                options={[
                  { value: '', label: 'Select working copy' },
                  ...workingCopies.map((item) => ({ value: item.id, label: item.name })),
                ]}
              />
            </FormField>
            <FormField label="Profile name">
              <Input value={profileLabel} onChange={(event) => setProfileLabel(event.target.value)} />
            </FormField>
            <Button disabled={!canVersion || !selectedTemplateId} onClick={createVersion}>
              Create immutable version
            </Button>
            {versions.map((version) => (
              <div className="tenancy-template-meta" key={version.id}>
                <p>
                  <strong>{version.profileLabel}</strong> · v{version.version}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!canVersion}
                  onClick={() => rollback(version)}
                >
                  Rollback working copy
                </Button>
              </div>
            ))}
          </Card.Body>
        </Card>
      </section>
    </main>
  );
};

export default TeamWorkflowPage;
