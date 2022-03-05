import { EntityId } from '@reduxjs/toolkit';
import { batchActions } from 'redux-batched-actions';
import { StatusCodes } from 'http-status-codes';
import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
  takeLeading
} from 'redux-saga/effects';

import {
  explorerClosed,
  explorerOpened,
  explorerViewUpdated,
  imageSelected,
  imagesUpdated,
  Navigation,
  newPageAdded,
  pageDeleted,
  pageDeselected,
  pageNumberUpdated,
  selectExplorerId,
  selectImageSelected,
  selectNavigation,
  selectSelectedPage,
  selectWebpageCanceled,
  selectWebpageHistory,
  selectedPageUpdated,
  statusCodeUpdated,
  urlSelected,
  WebpageHistory,
  webpageHistoryUpdated,
  webpageSelected,
  webpageUpdated
} from './explorerSlice';
import {
  createPage,
  deletePage,
  editPageNumber,
  editPageUrl,
  loadPages
} from '../comic/comicSaga';
import {
  bookmarkUpdated,
  Comic,
  Page,
  selectComic
} from '../comic/comicSlice';
import { loadImage, updateImage } from '../comic/imageSaga';
import {
  Image,
  imageAdded,
  imageRemovedAll,
  imageUpdated,
  selectImage,
  WebImage
} from '../comic/imageSlice';
import {
  downloaderFinished,
  downloaderStarted,
  downloaderStopped,
  RequestType,
  ResponseState
} from '../downloader/downloaderSlice';
import { updaterPageAdded } from '../updater/updaterSlice';
import { createBufferFromObjectUrl, createObjectUrlFromBuffer } from 'utils';

function* onImagesDownloaded(images: DbWebImage[]) {
  yield put(imagesUpdated(images.sort((a, b) => (
    a.src.localeCompare(b.src)
  )).map(({ data, type, ...props }) => ({
     ...props,
     url: createObjectUrlFromBuffer(data, type)
  }))));
}

function* onWebpageDownloaded(webpage: Webpage) {
  const navigation: Navigation = yield select(selectNavigation);
  const history: WebpageHistory = yield select(selectWebpageHistory);

  yield put(webpageHistoryUpdated([ ...history, webpage ]));

  if (navigation === 'selectImage') {  // Proceed to fetch images
    const selectedPage: Page = yield select(selectSelectedPage);

    yield put(downloaderStarted({
      type: RequestType.Images,
      urls: webpage.images.map(({ src }) => src),
      comicId: selectedPage.comicId,
      pageId: selectedPage.id
    }));
  }
}

function* onDownloaderFailed(type: RequestType, statusCode?: StatusCodes) {
  if (type === RequestType.Webpage) {
    yield put(statusCodeUpdated(statusCode));
  } else if (type === RequestType.Images) {
    yield put(pageDeselected());
  }
}

function* watchDownloaderFinished() {
  yield takeLeading(downloaderFinished, function* ({ payload }) {
    const { comicId, pageId } = payload;
    const explorerId: EntityId | null = yield select(selectExplorerId);
    if (explorerId !== comicId) {
      return;  // No need to update UI
    }

    const selectedPage: Page | null | undefined = yield select(
      selectSelectedPage
    );

    if ((selectedPage && selectedPage.id) !== pageId) {
      return;
    }

    if (payload.state === ResponseState.Success) {
      if (payload.type === RequestType.Images) {
        yield call(onImagesDownloaded, payload.images);
      } else if (payload.type === RequestType.Webpage) {
        yield call(onWebpageDownloaded, payload.webpage);
      }
    } else {
      yield call(onDownloaderFailed, payload.type, payload.statusCode);
    }
  });
}

function* onExplorerClosed(comicId: EntityId) {
  // Load pages around bookmark
  const comic: Comic = yield select(selectComic(comicId));

  if (comic.bookmark !== -1) {
    yield put(bookmarkUpdated({ page: comic.pages[comic.bookmark] }));
  } else {  // Clear images
    yield put(imageRemovedAll());
  }
}

function* watchExplorerClosed() {
  yield takeLeading(explorerClosed, ({ payload }) => (
    onExplorerClosed(payload.comicId)
  ));
}

function* onExplorerOpened(comicId: EntityId) {
  const comic: Comic = yield select(selectComic(comicId));

  if (comic.bookmark !== -1) {
    yield call(loadPages, comic, comic.bookmark, 5);
  }
}

function* watchExplorerOpened() {
  yield takeLeading(explorerOpened, ({ payload }) => (
    onExplorerOpened(payload.comicId)
  ));
}

function* onExplorerViewUpdated(
  comicId: EntityId,
  index: number,
  range: number
) {
  const comic: Comic = yield select(selectComic(comicId));
  yield call(loadPages, comic, index, range);
}

function* watchExplorerViewUpdated() {
  yield takeLatest(explorerViewUpdated, ({ payload }) => (
    onExplorerViewUpdated(payload.comicId, payload.index, payload.range)
  ));
}

function* onImageSelected(page: Page, image: WebImage) {
  yield call(updateImage, page.id, image);

  // Update images
  yield put(imageUpdated({
    id: page.id,
    changes: (yield call(loadImage, page.id)) as Image
  }));
}

function* watchImageSelected() {
  yield takeLeading(imageSelected, ({ payload }) => onImageSelected(
    payload.page, payload.image
  ));
}

function* onNewPageAdded(comicId: EntityId, url: string, image: WebImage) {
  const buffer: TypedBuffer = yield call(createBufferFromObjectUrl, image.url);

  const page: Page = yield call(createPage, comicId, url, {
    src: image.src,
    width: image.width,
    height: image.height,
    sha256: image.sha256,
    ...buffer
  });

  yield put(batchActions([
    imageAdded(yield call(loadImage, page.id)),
    pageDeselected()
  ]));
}

function* watchNewPageAdded() {
  yield takeLeading(newPageAdded, ({ payload }) => (
    onNewPageAdded(payload.comicId, payload.url, payload.image)
  ));
}

function* onPageDeleted(page: Page) {
  yield call(deletePage, page);
}

function* watchPageDeleted() {
  yield takeLeading(pageDeleted, ({ payload }) => onPageDeleted(
    payload
  ));
}

function* onPageNumberUpdated(page: Page, pageNumber: number) {
  yield call(editPageNumber, page, pageNumber);
}

function* watchPageNumberUpdated() {
  yield takeLeading(pageNumberUpdated, ({ payload }) => onPageNumberUpdated(
    payload.page, payload.pageNumber
  ));
}

function* onSelectImageSelected() {
  const selectedPage: Page = yield select(selectSelectedPage);
  const history: WebpageHistory = yield select(selectWebpageHistory);

  if (history.length === 0) {  // Download webpage
    yield put(downloaderStarted({
      type: RequestType.Webpage,
      url: selectedPage.url,
      comicId: selectedPage.comicId,
      pageId: selectedPage.id
    }));
  } else {  // Download images
    const webpage = history[history.length - 1];
    yield put(downloaderStarted({
      type: RequestType.Images,
      urls: webpage.images.map(({ src }) => src),
      comicId: selectedPage.comicId,
      pageId: selectedPage.id
    }));
  }
}

function* watchSelectImageSelected() {
  yield takeLeading(selectImageSelected, onSelectImageSelected);
}

function* onSelectWebpageCanceled() {
  yield put(downloaderStopped());
}

function* watchSelectWebpageCanceled() {
  yield takeLeading(selectWebpageCanceled, onSelectWebpageCanceled);
}

function* onUpdaterPageAdded(page: Page) {
  // Check if this comic's explorer is open
  const explorerId: EntityId = yield select(selectExplorerId);
  if (page.comicId === explorerId) {  // Load image
    const image: Image | undefined = yield select(selectImage(page.id));
    if (image === undefined) {
      yield put(imageAdded(yield loadImage(page.id)));
    }
  }
}

function* watchUpdaterPageAdded() {
  yield takeEvery(updaterPageAdded, ({ payload }) => (
    onUpdaterPageAdded(payload.page)
  ));
}

function* onUrlSelected(
  url: string,
  comicId: EntityId,
  pageId?: EntityId | null
) {
  yield put(downloaderStarted({  // Fetch webpage
    type: RequestType.Webpage,
    url,
    comicId,
    pageId
  }));
}

function* watchUrlSelected() {
  yield takeLeading(urlSelected, ({ payload }) => onUrlSelected(
    payload.url, payload.comicId, payload.pageId
  ));
}

function* onWebpageSelected(comicId: EntityId, webpage: Webpage) {
  yield put(downloaderStarted({  // Fetch images
    type: RequestType.Images,
    urls: webpage.images.map(({ src }) => src),
    comicId,
    pageId: null
  }));
}

function* watchWebpageSelected() {
  yield takeLeading(webpageSelected, ({ payload }) => onWebpageSelected(
    payload.comicId, payload.webpage
  ));
}

function* onWebpageUpdated(page: Page, url: string) {
  const newPage: Page = yield call(editPageUrl, page, url);

  yield put(selectedPageUpdated(newPage));
}

function* watchWebpageUpdated() {
  yield takeLeading(webpageUpdated, ({ payload }) => onWebpageUpdated(
    payload.page, payload.url
  ));
}

export default function* explorerSaga() {
  yield all([
    call(watchDownloaderFinished),
    call(watchExplorerClosed),
    call(watchExplorerOpened),
    call(watchExplorerViewUpdated),
    call(watchImageSelected),
    call(watchNewPageAdded),
    call(watchPageDeleted),
    call(watchPageNumberUpdated),
    call(watchSelectImageSelected),
    call(watchSelectWebpageCanceled),
    call(watchUpdaterPageAdded),
    call(watchUrlSelected),
    call(watchWebpageSelected),
    call(watchWebpageUpdated)
  ]);
}
