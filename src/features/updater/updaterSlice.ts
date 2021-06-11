import {
  createAction,
  createEntityAdapter,
  createSlice,
  EntityId
} from '@reduxjs/toolkit';
import { StatusCodes } from 'http-status-codes';

import { RootState } from 'app/store';
import { Page } from '../comic/comicSlice';
import { ResponseState } from '../downloader/downloaderSlice';

export enum UpdateMode {
  MultiplePages,
  SinglePage
}

export type UpdateResponse = {
  message?: string,
  state: ResponseState,
  statusCode?: StatusCodes
};

export type UpdateRequest = {
  mode: UpdateMode,
  progress?: string,
  response?: UpdateResponse
};

export type Updater = {
  comicId: EntityId,
  running: boolean,
  request?: UpdateRequest
};

const updaterAdapter = createEntityAdapter<Updater>({
  selectId: updater => updater.comicId
});

const updaterSlice = createSlice({
  name: 'updater',
  initialState: updaterAdapter.getInitialState(),
  reducers: {
    updaterAdded: updaterAdapter.addOne,
    updaterAllSet: updaterAdapter.setAll,
    updaterRemoved: updaterAdapter.removeOne,
    updaterUpdated: updaterAdapter.updateOne
  }
});

export const {
  updaterAdded,
  updaterAllSet,
  updaterRemoved,
  updaterUpdated
} = updaterSlice.actions;

export const updaterPageAdded = createAction<{
  page: Page
}>('autoUpdater/pageAdded');

export const updaterStarted = createAction<{
  comicId: EntityId,
  mode: UpdateMode
}>('autoUpdater/started');

export const updaterStopped = createAction<{
  comicId: EntityId
}>('autoUpdater/stopped');

export const selectUpdater = (comicId?: EntityId) => (state: RootState) => {
  if (comicId === undefined) {
    return undefined;
  }

  return updaterAdapter.getSelectors().selectById(state.updater, comicId);
};

export const selectUpdaters = (state: RootState) => {
  return updaterAdapter.getSelectors().selectAll(state.updater);
};

export default updaterSlice.reducer;
