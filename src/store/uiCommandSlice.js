import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEY_CHAT_DOCK, STORAGE_KEY_LEFT_RAIL } from '../constants/storageKeys';

const readPersistedUiCommandState = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { leftRail: 'expanded', chatOpen: false };
  }

  try {
    return {
      leftRail: window.localStorage.getItem(STORAGE_KEY_LEFT_RAIL) === 'collapsed' ? 'collapsed' : 'expanded',
      chatOpen: window.localStorage.getItem(STORAGE_KEY_CHAT_DOCK) === 'open',
    };
  } catch {
    return { leftRail: 'expanded', chatOpen: false };
  }
};

export const persistUiCommandState = ({ leftRail, chatOpen }) => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    window.localStorage.setItem(STORAGE_KEY_LEFT_RAIL, leftRail === 'collapsed' ? 'collapsed' : 'expanded');
    window.localStorage.setItem(STORAGE_KEY_CHAT_DOCK, chatOpen ? 'open' : 'closed');
  } catch {
    /* ignore */
  }
};

const createInitialState = () => {
  const persistedState = readPersistedUiCommandState();
  return {
    leftRail: persistedState.leftRail,
    drawerTab: null,
    chatOpen: persistedState.chatOpen,
    chatActivationKey: 0,
    printTrigger: 0,
    previewMode: false,
    commandPaletteOpen: false,
  };
};

const uiCommandSlice = createSlice({
  name: 'uiCommand',
  initialState: createInitialState,
  reducers: {
    toggleLeftRail: (state) => {
      state.leftRail = state.leftRail === 'expanded' ? 'collapsed' : 'expanded';
    },
    setLeftRail: (state, action) => {
      state.leftRail = action.payload === 'collapsed' ? 'collapsed' : 'expanded';
    },
    openDrawer: (state, action) => {
      state.drawerTab = action.payload;
    },
    closeDrawer: (state) => {
      state.drawerTab = null;
    },
    openChat: (state, action) => {
      state.chatOpen = true;
      if (action.payload?.activate) {
        state.chatActivationKey += 1;
      }
    },
    closeChat: (state) => {
      state.chatOpen = false;
    },
    toggleChat: (state, action) => {
      state.chatOpen = !state.chatOpen;
      if (state.chatOpen && action.payload?.activate) {
        state.chatActivationKey += 1;
      }
    },
    requestChatActivation: (state) => {
      state.chatOpen = true;
      state.chatActivationKey += 1;
    },
    triggerPrint: (state) => {
      state.printTrigger += 1;
      state.previewMode = true;
    },
    openPreview: (state) => {
      state.previewMode = true;
    },
    closePreview: (state) => {
      state.previewMode = false;
    },
    togglePreview: (state) => {
      state.previewMode = !state.previewMode;
    },
    setPreviewMode: (state, action) => {
      state.previewMode = Boolean(action.payload);
    },
    openCommandPalette: (state) => {
      state.commandPaletteOpen = true;
    },
    closeCommandPalette: (state) => {
      state.commandPaletteOpen = false;
    },
    toggleCommandPalette: (state) => {
      state.commandPaletteOpen = !state.commandPaletteOpen;
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
  requestChatActivation,
  triggerPrint,
  openPreview,
  closePreview,
  togglePreview,
  setPreviewMode,
  openCommandPalette,
  closeCommandPalette,
  toggleCommandPalette,
} = uiCommandSlice.actions;

export const selectLeftRail = (state) => state.uiCommand.leftRail;
export const selectDrawerTab = (state) => state.uiCommand.drawerTab;
export const selectChatOpen = (state) => state.uiCommand.chatOpen;
export const selectChatActivationKey = (state) => state.uiCommand.chatActivationKey;
export const selectPrintTrigger = (state) => state.uiCommand.printTrigger;
export const selectPreviewMode = (state) => state.uiCommand.previewMode;
export const selectCommandPaletteOpen = (state) => state.uiCommand.commandPaletteOpen;

export default uiCommandSlice.reducer;
