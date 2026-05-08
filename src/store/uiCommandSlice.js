/**
 * uiCommandSlice.js — Redux-managed UI command state.
 *
 * Replaces the custom `window.dispatchEvent` / `window.addEventListener`
 * event bus that was previously used to communicate between components
 * (henry:toggle-left-rail, henry:open-compliance, etc.).  Moving these
 * into Redux makes the flow testable, traceable in DevTools, and
 * eliminates the global window coupling.
 *
 * Slices managed here:
 *   leftRailOpen  — sidebar expanded/collapsed state (was RAIL_KEY)
 *   drawerTab     — which drawer panel is open (compliance/archive/audit/null)
 *   chatOpen      — floating Ask-Henry chat panel
 *   printTrigger  — incrementing counter watched by DocumentHubPage to fire print
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  /** Sidebar rail open/collapsed ('expanded' | 'collapsed') */
  leftRail: 'expanded',
  /** Active drawer tab: null | 'compliance' | 'archive' | 'audit' */
  drawerTab: null,
  /** Whether the Ask-Henry chat panel is open */
  chatOpen: false,
  /** Incrementing counter; a useEffect watches it to trigger window.print() */
  printTrigger: 0,
};

const uiCommandSlice = createSlice({
  name: 'uiCommand',
  initialState,
  reducers: {
    /** Toggle the left sidebar rail between expanded and collapsed. */
    toggleLeftRail: (state) => {
      state.leftRail = state.leftRail === 'expanded' ? 'collapsed' : 'expanded';
    },
    setLeftRail: (state, action) => {
      state.leftRail = action.payload === 'collapsed' ? 'collapsed' : 'expanded';
    },
    openDrawer: (state, action) => {
      state.drawerTab = action.payload; // 'compliance' | 'archive' | 'audit'
    },
    closeDrawer: (state) => {
      state.drawerTab = null;
    },
    openChat: (state) => {
      state.chatOpen = true;
    },
    closeChat: (state) => {
      state.chatOpen = false;
    },
    toggleChat: (state) => {
      state.chatOpen = !state.chatOpen;
    },
    triggerPrint: (state) => {
      state.printTrigger += 1;
    },
  },
});

export const {
  toggleLeftRail,
  setLeftRail,
  openDrawer,
  closeDrawer,
  openChat,
  closeChat,
  toggleChat,
  triggerPrint,
} = uiCommandSlice.actions;

// Selectors
export const selectLeftRail = (state) => state.uiCommand.leftRail;
export const selectDrawerTab = (state) => state.uiCommand.drawerTab;
export const selectChatOpen = (state) => state.uiCommand.chatOpen;
export const selectPrintTrigger = (state) => state.uiCommand.printTrigger;

export default uiCommandSlice.reducer;
