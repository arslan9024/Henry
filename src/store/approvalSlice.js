import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = { requests: [] };

const approvalSlice = createSlice({
  name: 'approvals',
  initialState,
  reducers: {
    submitApproval: {
      reducer: (state, action) => {
        state.requests.unshift(action.payload);
      },
      prepare: ({ recordId, submittedBy, comment = '' }) => ({
        payload: {
          id: nanoid(),
          recordId,
          status: 'pending-manager',
          submittedBy,
          comment,
          submittedAt: new Date().toISOString(),
          history: [],
        },
      }),
    },
    reviewApproval: (state, action) => {
      const { id, decision, reviewer, role, comment = '' } = action.payload || {};
      const request = state.requests.find((item) => item.id === id);
      if (!request || !['approved', 'rejected'].includes(decision)) return;
      if (role !== 'manager' && role !== 'admin') return;
      request.status = decision;
      request.reviewedAt = new Date().toISOString();
      request.history.push({ decision, reviewer, role, comment, at: request.reviewedAt });
    },
    resubmitApproval: (state, action) => {
      const request = state.requests.find((item) => item.id === action.payload?.id);
      if (!request || request.status !== 'rejected') return;
      request.status = 'pending-manager';
      request.comment = action.payload.comment || request.comment;
      request.submittedAt = new Date().toISOString();
    },
  },
});

export const { resubmitApproval, reviewApproval, submitApproval } = approvalSlice.actions;
export const selectApprovalRequests = (state) => state.approvals?.requests || [];
export default approvalSlice.reducer;
