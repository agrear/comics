import { EntityId } from '@reduxjs/toolkit';
import { all, call, takeLatest } from 'redux-saga/effects';

import { comicLastViewedUpdated } from './historySlice';

function* onComicLastViewedUpdated(comicId: EntityId) {
  yield call(window.comicsApi.updateHistory, comicId);
}

export function* watchComicLastViewedUpdated() {
  yield takeLatest(comicLastViewedUpdated, ({ payload }) => (
    onComicLastViewedUpdated(payload.comicId)
  ));
}

export default function* historySaga() {
  yield all([
    call(watchComicLastViewedUpdated)
  ]);
}
