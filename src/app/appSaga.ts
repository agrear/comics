import { batchActions } from 'redux-batched-actions';
import { all, call, put, takeEvery } from 'redux-saga/effects';

import { appInitialized, appLoaded } from './appSlice';
import { loadComics } from '../features/comic/comicSaga';
import { Comic, comicAllSet } from '../features/comic/comicSlice';
import { HistoryState, historySet } from '../features/history/historySlice';
import {
  Preferences,
  preferencesSet
} from '../features/settings/preferencesSlice';
import { updaterAllSet } from '../features/updater/updaterSlice';

function* onAppInitialized() {
  const comics: Comic[] = yield call(loadComics);

  const history: HistoryState = yield call(window.comicsApi.getHistory);
  if (history.comicId === undefined && comics.length > 0) {
    history.comicId = comics[0].id;
  }

  const preferences: Preferences = yield call(window.comicsApi.getPreferences);

  // Put data into store
  yield put(batchActions([
    updaterAllSet(comics.map(({ id }) => ({ comicId: id, running: false }))),
    comicAllSet(comics),
    historySet(history),
    preferencesSet(preferences),
    appLoaded()
  ]));
}

function* watchAppStarted() {
  yield takeEvery(appInitialized, onAppInitialized);
}

export default function* appSaga() {
  yield all([
    call(watchAppStarted)
  ]);
}
