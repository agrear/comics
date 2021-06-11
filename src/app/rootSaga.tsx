import { all, call } from 'redux-saga/effects';

import appSaga from './appSaga';
import comicSaga from '../features/comic/comicSaga';
import downloaderSaga from '../features/downloader/downloaderSaga';
import explorerSaga from '../features/explorer/explorerSaga';
import historySaga from '../features/history/historySaga';
import preferencesSaga from '../features/settings/preferencesSaga';
import updaterSaga from '../features/updater/updaterSaga';

export default function *rootSaga() {
  yield all([
    call(appSaga),
    call(comicSaga),
    call(downloaderSaga),
    call(explorerSaga),
    call(historySaga),
    call(preferencesSaga),
    call(updaterSaga)
  ]);
}
