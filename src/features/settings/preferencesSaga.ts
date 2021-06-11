import { batchActions } from 'redux-batched-actions';
import { all, call, put, takeLatest } from 'redux-saga/effects';

import {
  activeWindowModeUpdated,
  fullscreenToggled,
  minimizeToTrayUpdated,
  openAtLoginUpdated,
  WindowMode,
  windowModeUpdated
} from './preferencesSlice';

function* onFullscreenToggled() {
  const windowMode: WindowMode = yield call(window.comicsApi.toggleFullscreen);

  yield put(batchActions([
    activeWindowModeUpdated(windowMode),
    windowModeUpdated(windowMode)
  ]));
}

function* watchFullscreenToggled() {
  yield takeLatest(fullscreenToggled, onFullscreenToggled);
}

function* onMinimizeToTrayUpdated(minimizeToTray: boolean) {
  yield call(window.comicsApi.setMinimizeToTray, minimizeToTray);
}

export function* watchMinimizeToTrayUpdated() {
  yield takeLatest(minimizeToTrayUpdated, ({ payload }) => (
    onMinimizeToTrayUpdated(payload)
  ));
}

function* onOpenAtLoginUpdated(openAtLogin: boolean) {
  yield call(window.comicsApi.setOpenAtLogin, openAtLogin);
}

function* watchOpenAtLoginUpdated() {
  yield takeLatest(openAtLoginUpdated, ({ payload }) => (
    onOpenAtLoginUpdated(payload)
  ));
}

function* onWindowModeUpdated(windowMode: WindowMode) {
  const success: boolean = yield call(
    window.comicsApi.setWindowMode, windowMode
  );

  if (success) {
    yield put(activeWindowModeUpdated(windowMode));
  }
}

function* watchWindowModeUpdated() {
  yield takeLatest(windowModeUpdated, ({ payload }) => (
    onWindowModeUpdated(payload)
  ));
}

export default function* preferencesSaga() {
  yield all([
    call(watchFullscreenToggled),
    call(watchMinimizeToTrayUpdated),
    call(watchOpenAtLoginUpdated),
    call(watchWindowModeUpdated)
  ]);
}
