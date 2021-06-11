import { createAction, createSlice } from '@reduxjs/toolkit';

import { RootState } from './store';

export type AppState = {
  ready: boolean
};

const initialState: AppState = {
  ready: false
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    appLoaded(state) {
      state.ready = true;
    }
  }
});

export const { appLoaded } = appSlice.actions;

export const appInitialized = createAction('app/initialized');

export const selectAppReady = (state: RootState) => state.app.ready;

export default appSlice.reducer;
