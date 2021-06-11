import { combineReducers } from '@reduxjs/toolkit';

import appReducer from './appSlice';
import comicReducer from '../features/comic/comicSlice';
import downloaderReducer from '../features/downloader/downloaderSlice';
import historyReducer from '../features/history/historySlice';
import imageReducer from '../features/comic/imageSlice';
import explorerReducer from '../features/explorer/explorerSlice';
import preferencesReducer from '../features/settings/preferencesSlice';
import updaterReducer from '../features/updater/updaterSlice';

export const rootReducer = combineReducers({
  app: appReducer,
  comic: comicReducer,
  downloader: downloaderReducer,
  explorer: explorerReducer,
  history: historyReducer,
  image: imageReducer,
  preferences: preferencesReducer,
  updater: updaterReducer
});

export default rootReducer;
