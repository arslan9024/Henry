import { describe, expect, it } from 'vitest';
import approvalReducer, { reviewApproval, submitApproval } from './approvalSlice';
import userReducer, { ROLE_PERMISSIONS, setAuthenticatedUser, setDemoRole } from './userAccessSlice';

describe('team-scale state', () => {
  it('enforces known roles and permission tiers', () => {
    let state = userReducer(undefined, setDemoRole('manager'));
    expect(state.user.role).toBe('manager');
    expect(ROLE_PERMISSIONS.manager).toContain('approval.review');
    state = userReducer(state, setAuthenticatedUser({ id: '1', role: 'unknown' }));
    expect(state.user.role).toBe('operator');
  });

  it('allows only manager/admin review transitions', () => {
    let state = approvalReducer(undefined, submitApproval({ recordId: 'r1', submittedBy: 'operator' }));
    const id = state.requests[0].id;
    state = approvalReducer(
      state,
      reviewApproval({ id, decision: 'approved', reviewer: 'op', role: 'operator' }),
    );
    expect(state.requests[0].status).toBe('pending-manager');
    state = approvalReducer(
      state,
      reviewApproval({ id, decision: 'approved', reviewer: 'mgr', role: 'manager' }),
    );
    expect(state.requests[0].status).toBe('approved');
    expect(state.requests[0].history).toHaveLength(1);
  });
});
