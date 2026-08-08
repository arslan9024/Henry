import { createSlice } from '@reduxjs/toolkit';

export const USER_ROLES = ['operator', 'manager', 'admin'];
export const ROLE_PERMISSIONS = {
  operator: ['record.edit', 'approval.submit', 'template.use'],
  manager: ['record.edit', 'approval.submit', 'approval.review', 'template.use', 'template.version'],
  admin: [
    'record.edit',
    'approval.submit',
    'approval.review',
    'approval.override',
    'template.use',
    'template.version',
    'access.manage',
  ],
};

const initialState = {
  user: { id: 'local-operator', displayName: 'Henry Operator', role: 'operator', provider: 'local' },
  authStatus: 'local-fallback',
};

const userAccessSlice = createSlice({
  name: 'userAccess',
  initialState,
  reducers: {
    setAuthenticatedUser: (state, action) => {
      const user = action.payload;
      state.user = user && USER_ROLES.includes(user.role) ? user : initialState.user;
      state.authStatus = user ? 'authenticated' : 'local-fallback';
    },
    setDemoRole: (state, action) => {
      if (USER_ROLES.includes(action.payload)) state.user.role = action.payload;
    },
    signOut: () => initialState,
  },
});

export const { setAuthenticatedUser, setDemoRole, signOut } = userAccessSlice.actions;
export const selectCurrentUser = (state) => state.userAccess?.user || initialState.user;
export const selectCan = (permission) => (state) =>
  ROLE_PERMISSIONS[selectCurrentUser(state).role]?.includes(permission) || false;
export default userAccessSlice.reducer;
