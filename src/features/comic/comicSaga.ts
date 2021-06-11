import { clamp } from '@popmotion/popcorn';
import { Action, EntityId } from '@reduxjs/toolkit';
import { batchActions } from 'redux-batched-actions';
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
  bookmarkUpdated,
  Comic,
  comicAdded,
  comicBrightnessUpdated,
  comicClosed,
  comicDeleted,
  ComicEditFormState,
  comicEditFormSubmitted,
  comicLayoutUpdated,
  comicMarkedAsRead,
  comicOpened,
  comicRemoved,
  comicUpdated,
  comicUpdatesUpdated,
  Page,
  selectComic,
  Updates
} from './comicSlice';
import { convertToCover, loadImage } from './imageSaga';
import {
  Image,
  imageAddedMany,
  imageRemoved,
  imageRemovedAll,
  imageRemovedMany,
  selectImages
} from './imageSlice';
import {
  Updater,
  updaterAdded,
  updaterRemoved,
  updaterStopped,
  selectUpdater
} from '../updater/updaterSlice';
import { createBufferFromObjectUrl, Layout } from 'utils';

export function* loadComic(comicId: EntityId) {
  const { cover, ...comic }: DbComic = yield call(
    window.comicsApi.getComic, comicId
  );

  return { cover: convertToCover(cover), ...comic };
}

export function* loadComics() {
  const comics: Comic[] = yield call(window.comicsApi.getComics);
  return comics.map(({ cover, ...comic }: any) => ({
    cover: convertToCover(cover),
    ...comic
  }))
}

export function* loadPages(comic: Comic, index: number, range: number) {
  // Find range indices
  const min = clamp(0, comic.pages.length, index - range);
  const max = clamp(0, comic.pages.length, index + range + 1);
  const newPages = comic.pages.slice(min, max).map(({ id }) => id);

  // Remove images outside range
  const images: Image[] = yield select(selectImages);
  const pageIds = images.map(({ id }) => id);
  const imagesRemoved = pageIds.filter(pageId => (
    !newPages.includes(pageId)
  ));

  // Load images inside range
  const imagesAdded = [];
  for (const pageId of newPages.filter(id => !pageIds.includes(id))) {
    const image: Image | undefined = yield call(loadImage, pageId);
    if (image !== undefined) {
      imagesAdded.push(image);
    }
  }

  yield put(batchActions([
    imageAddedMany(imagesAdded),
    imageRemovedMany(imagesRemoved)
  ]));
}

export function* createPage(
  comicId: EntityId,
  url: string,
  image: DbWebImage
) {
  const page: Page = yield call(
    window.comicsApi.insertPage,
    comicId,
    url,
    image.src,
    { type: image.type, data: image.data }
  );

  const actions: Action[] = [];

  // Update pages
  const pages: Page[] = yield call(window.comicsApi.getPages, comicId);
  actions.push(comicUpdated({ id: comicId, changes: { pages } }));

  // Update bookmark
  const comic: Comic = yield select(selectComic(comicId));
  if (comic.bookmark === -1) {
    actions.push(comicUpdated({ id: comicId, changes: { bookmark: 0 } }));
  }

  yield put(batchActions(actions));

  return page;
}

export function* deletePage(page: Page) {
  yield call(window.comicsApi.deletePage, page.id);

  const pages: Page[] = yield call(window.comicsApi.getPages, page.comicId);
  const bookmark: number = yield call(
    window.comicsApi.getBookmark, page.comicId
  );

  yield put(batchActions([
    comicUpdated({ id: page.comicId, changes: { bookmark, pages } }),
    imageRemoved(page.id)
  ]));
}

export function* editPageUrl(page: Page, url: string) {
  yield call(window.comicsApi.updatePageUrl, page.id, url);

  const updatedPage = { ...page, url };

  const comic: Comic = yield select(selectComic(page.comicId));
  yield put(comicUpdated({
    id: page.comicId,
    changes: {
      pages: comic.pages.map(page => (
        page.id !== updatedPage.id ? page : updatedPage
      ))
    }
  }));

  return updatedPage;
}

export function* editPageNumber(page: Page, pageNumber: number) {
  yield call(window.comicsApi.updatePageNumber, page.id, pageNumber);

  const pages: Page[] = yield call(window.comicsApi.getPages, page.comicId);
  yield put(comicUpdated({ id: page.comicId, changes: { pages } }));
}

function* onBookmarkUpdated(page: Page) {
  const accessed = new Date();
  const comic: Comic = yield select(selectComic(page.comicId));

  yield call(window.comicsApi.updateComicAccessed, page.comicId, accessed);
  yield call(window.comicsApi.updateBookmark, page.comicId, page.number);
  yield call(window.comicsApi.updatePageAccessed, page.id, accessed);

  yield put(
    comicUpdated({
      id: page.comicId,
      changes: {
        accessed,
        bookmark: page.number,
        pages: comic.pages.map(p => (
          p.id !== page.id ? p : { ...page, accessed }
        ))
      }
    })
  );

  // Load adjacent pages
  yield call(loadPages, comic, page.number, 3);
}

function* watchBookmarkUpdated() {
  yield takeLatest(bookmarkUpdated, ({ payload }) => (
    onBookmarkUpdated(payload.page)
  ));
}

function* onComicBrightnessUpdated(comicId: EntityId, brightness: number) {
  yield call(window.comicsApi.updateComicBrightness, comicId, brightness);

  yield put(comicUpdated({ id: comicId, changes: { brightness } }));
}

function* watchComicBrightnessUpdated() {
  yield takeLatest(comicBrightnessUpdated, ({ payload }) => (
    onComicBrightnessUpdated(payload.comicId, payload.brightness)
  ));
}

function* onComicClosed(comicId: EntityId) {
  yield put(imageRemovedAll());
}

function* watchComicClosed() {
  yield takeEvery(comicClosed, ({ payload }) => onComicClosed(payload.id));
}

function* onComicDeleted(comicId: EntityId) {
  window.comicsApi.deleteComic(comicId);

  // Remove updater
  const updater: Updater = yield select(selectUpdater(comicId));
  if (updater.running) {  // TODO: Stop updater
    yield put(updaterStopped({ comicId }));
  }

  yield put(batchActions([
    comicRemoved(comicId),
    updaterRemoved(comicId)
  ]));
}

function* watchComicDeleted() {
  yield takeEvery(comicDeleted, ({ payload }) => onComicDeleted(payload.id));
}

function* onComicEditFormSubmitted(data: ComicEditFormState) {
  const { id, cover, ...meta } = data;

  const serializedCover: TypedBuffer = yield call(
    createBufferFromObjectUrl, cover.url
  );

  if (id === undefined) {  // Add new comic
    const { cover: dbCover, ...dbComic }: DbComic = yield call(
      window.comicsApi.insertComic, serializedCover, meta
    );

    const comic = { cover: convertToCover(dbCover), ...dbComic };

    // Add to store
    yield put(batchActions([
      comicAdded(comic),
      updaterAdded({ comicId: comic.id, running: false })
    ]));
  } else {
    window.comicsApi.updateComic(id, serializedCover, meta);

    const comic: Comic = yield call(loadComic, id);
    yield put(comicUpdated({ id, changes: comic }));
  }
}

export function* watchComicEditFormSubmitted() {
  yield takeEvery(comicEditFormSubmitted, ({ payload }) => (
    onComicEditFormSubmitted(payload))
  );
}

function* onComicLayoutUpdated(comicId: EntityId, layout: Partial<Layout>) {
  const comic: Comic = yield select(selectComic(comicId));

  yield call(window.comicsApi.updateComicLayout, comicId, {
    ...comic.layout, ...layout
  });

  yield put(
    comicUpdated({
      id: comicId,
      changes: {
        layout: { ...comic.layout, ...layout }
      }
    })
  );
}

function* watchComicLayoutUpdated() {
  yield takeLatest(comicLayoutUpdated, ({ payload }) => (
    onComicLayoutUpdated(payload.comicId, payload.layout)
  ));
}

function* onComicMarkedAsRead(comicId: EntityId) {
  yield call(window.comicsApi.markComicAsRead, comicId);

  const pages: Page[] = yield call(window.comicsApi.getPages, comicId);
  yield put(comicUpdated({ id: comicId, changes: { pages } }));
}

function* watchComicMarkedAsRead() {
  yield takeLeading(comicMarkedAsRead, ({ payload }) => (
    onComicMarkedAsRead(payload.comicId)
  ));
}

function* onComicOpened(comicId: EntityId) {
  const accessed = new Date();
  yield call(window.comicsApi.updateComicAccessed, comicId, accessed);

  yield put(batchActions([
    comicUpdated({ id: comicId, changes: { accessed } })
  ]));

  const comic: Comic = yield select(selectComic(comicId));

  if (comic.bookmark !== -1) {
    yield call(onBookmarkUpdated, comic.pages[comic.bookmark]);
  }
}

function* watchComicOpened() {
  yield takeEvery(comicOpened, ({ payload }) => onComicOpened(payload.id));
}

function* onComicUpdatesUpdated(comicId: EntityId, updates: Partial<Updates>) {
  const comic: Comic = yield select(selectComic(comicId));

  yield call(window.comicsApi.updateComicUpdates, comicId, {
    ...comic.updates, ...updates
  });

  yield put(
    comicUpdated({
      id: comicId,
      changes: {
        updates: { ...comic.updates, ...updates }
      }
    })
  );
}

function* watchComicUpdatesUpdated() {
  yield takeLatest(comicUpdatesUpdated, ({ payload }) => (
    onComicUpdatesUpdated(payload.comicId, payload.updates)
  ));
}

export default function* comicSaga() {
  yield all([
    call(watchBookmarkUpdated),
    call(watchComicBrightnessUpdated),
    call(watchComicClosed),
    call(watchComicDeleted),
    call(watchComicEditFormSubmitted),
    call(watchComicLayoutUpdated),
    call(watchComicMarkedAsRead),
    call(watchComicOpened),
    call(watchComicUpdatesUpdated)
  ]);
}
