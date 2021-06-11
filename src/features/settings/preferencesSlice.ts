import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'app/store';

export type WindowMode = 'fullscreen' | 'windowed' | 'borderless';

export type Preferences = {
  minimizeToTray: boolean,
  openAtLogin: boolean,
  windowMode: WindowMode,
  activeWindowMode: WindowMode
};

const initialState: Preferences = {
  minimizeToTray: false,
  openAtLogin: false,
  windowMode: 'windowed',
  activeWindowMode: 'windowed',
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    activeWindowModeUpdated(state, action: PayloadAction<WindowMode>) {
      state.activeWindowMode = action.payload;
    },
    minimizeToTrayUpdated(state, action: PayloadAction<boolean>) {
      state.minimizeToTray = action.payload;
    },
    openAtLoginUpdated(state, action: PayloadAction<boolean>) {
      state.openAtLogin = action.payload;
    },
    preferencesSet(state, action: PayloadAction<Preferences>) {
      state.minimizeToTray = action.payload.minimizeToTray;
      state.openAtLogin = action.payload.openAtLogin;
      state.windowMode = action.payload.windowMode;
      state.activeWindowMode = action.payload.windowMode;
    },
    windowModeUpdated(state, action: PayloadAction<WindowMode>) {
      state.windowMode = action.payload;
    }
  }
});

export const {
  activeWindowModeUpdated,
  minimizeToTrayUpdated,
  openAtLoginUpdated,
  preferencesSet,
  windowModeUpdated
} = preferencesSlice.actions;

export const fullscreenToggled = createAction('preferences/fullscreenToggled');

export const selectPreferences = (state: RootState) => {
  return state.preferences;
};

export const selectWindowModeRequiresRestart = (state: RootState) => (
  state.preferences.windowMode !== state.preferences.activeWindowMode
);

export default preferencesSlice.reducer;
