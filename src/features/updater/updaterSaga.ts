import { Action, EntityId, PayloadAction } from '@reduxjs/toolkit';
import { StatusCodes } from 'http-status-codes';
import { batchActions } from 'redux-batched-actions';
import { eventChannel, EventChannel } from 'redux-saga'
import {
  all,
  call,
  delay,
  put,
  race,
  select,
  take,
  takeEvery
} from 'redux-saga/effects';

import { createPage } from '../comic/comicSaga';
import {
  fetchImages,
  fetchWebpage,
  ImageResponse,
  WebpageResponse
} from '../downloader/downloaderSaga';
import { ResponseState } from '../downloader/downloaderSlice';
import {
  UpdateMode,
  UpdateResponse,
  Updater,
  updaterPageAdded,
  updaterStarted,
  updaterStopped,
  updaterUpdated,
  selectUpdater,
  selectUpdaters
} from './updaterSlice';
import { deletePage } from '../comic/comicSaga';
import {
  bookmarkUpdated,
  Comic,
  comicUpdated,
  Page,
  selectComic,
  selectNewPages
} from '../comic/comicSlice';
import { imageRemoved } from '../comic/imageSlice';
import { selectLastComicViewed } from '../history/historySlice';
import {
  findIndexLevenshtein,
  filterByLevenshteinDistance,
  getFutureDate,
  hobohm,
  sortByLevenshteinScore
} from 'utils';

type FetchedPage = {
  response: WebpageResponse,
  page?: Page | null
};

type Link = Webpage['links'][number];

const updateInterval = 5000;

function stringifyLink({ href, rel, classes, content }: Link) {
  return `<a href="${href}"` +
    (classes ? ` class="${classes}"` : '') +
    (rel ? ` rel="${rel}"` : '') +
    '>' + (content ? `${content}` : '') + '</a>';
}

function countdown() {
  return eventChannel(emitter => {
    const interval = setInterval(() => {
      emitter({});
    }, updateInterval);

    return () => {
      clearInterval(interval);
    }
  })
}

function* checkAutoUpdates() {
  const channel: EventChannel<{}> = yield call(countdown);

  while (true) {
    yield take(channel);

    const updaters: Updater[] = yield select(selectUpdaters);
    const now = new Date();

    for (const { comicId, running } of updaters) {
      if (running) {
        continue;
      }

      const comic: Comic = yield select(selectComic(comicId));
      if (!comic.updates.enabled) {
        continue;
      }

      const nextAutoUpdate = getFutureDate(
        comic.updates.interval, comic.updated ?? comic.created
      );

      if (now >= nextAutoUpdate) {
        yield put(updaterStarted({
          comicId,
          mode: UpdateMode.MultiplePages
        }));
      }
    }
  }
}

function* getStartingPage(comicId: EntityId, mode: UpdateMode) {
  let comic: Comic = yield select(selectComic(comicId));

  function* deleteLastPage(page: Page) {
    yield call(deletePage, page);

    yield put(batchActions([
      comicUpdated({
        id: comic.id,
        changes: {  // Remove last page
          pages: comic.pages.slice(0, comic.pages.length - 1)
        }
      }),
      imageRemoved(page.id)
    ]));

    comic = yield select(selectComic(comic.id));
  };

  // Start from last page
  let page: Page | null = comic.pages[comic.pages.length - 1] ?? null;

  yield put(updaterUpdated({
    id: comic.id,
    changes: {
      running: true,
      request: {
        mode,
        progress: `Fetching page${page ? ` ${page.number + 1}` : ''}\u2026`
      }
    }
  }));

  const maxRetries = 3;
  let retriesLeft = maxRetries;
  do {  // Find last valid page
    const response: WebpageResponse = yield call(
      fetchWebpage, page?.url ?? comic.url
    );

    if (response.state === ResponseState.Success) {
      if (page === null) {
        return { response, page };
      }

      // Make sure page's image still exists
      const imageInfo: ImageInfo = yield call(
        window.comicsApi.getImageInfo, page.id
      );

      if (response.webpage.images.find(({ src }) => src === imageInfo.src)) {
        yield put(updaterUpdated({
          id: comic.id,
          changes: {
            running: true,
            request: {
              mode,
              progress: `Verifying image of page ${page.number + 1}\u2026`
            }
          }
        }));

        // Verify image hasn't changed
        const imageResponse: ImageResponse = yield call(
          fetchImages, [imageInfo.src]
        );

        if (imageResponse.state === ResponseState.Success) {
          const { images } = imageResponse;
          if (images.length > 0 && images[0].sha256 === imageInfo.sha256) {
            return { response, page };  // Good to go
          }
        }
      }

      // Image changed or no longer exists
      yield call(deleteLastPage, page);
    } else if (response.state === ResponseState.Error) {
      if (page === null) {
        return { response };  // Unable to fetch any url
      }

      // Check if page's URL is still valid
      if (response.statusCode === StatusCodes.NOT_FOUND) {
        yield call(deleteLastPage, page);
      }
    } else {  // Timeout / Canceled
      return { response };
    }

    const retry = (maxRetries - retriesLeft) + 1;
    yield put(updaterUpdated({
      id: comic.id,
      changes: {
        running: true,
        request: {
          mode,
          progress: `Failed to verify page (Attempt #${retry})`
        }
      }
    }));

    // Try previous page
    page = comic.pages[page.number - 1] ?? null;
  } while (retriesLeft-- > 0);

  return {
    response: { state: ResponseState.Error }
  };
}

function* fetchPreviousWebpage(comicId: EntityId, page?: Page) {
  if (page === undefined) {
    return;
  }

  const comic: Comic = yield select(selectComic(comicId));
  const previousPage = comic.pages[page.number - 1];
  if (previousPage === undefined) {
    return;
  }

  const response: WebpageResponse = yield call(fetchWebpage, previousPage.url);
  if (response.state === ResponseState.Success) {
    return response.webpage;
  }
}

function getSortedCluster(url: string, urls: string[], threshold?: number) {
  const clusters = hobohm([url, ...urls], threshold);

  // First cluster contains search URL
  const cluster = clusters[0];
  cluster.splice(0, 1);  // Which we remove

  return sortByLevenshteinScore(url, cluster);
}

function findNextLink(searchUrl: string, webpage: Webpage) {
  const threshold = 0.9;
  const indices = filterByLevenshteinDistance(
    searchUrl,
    webpage.links.map(({ href }) => href),
    threshold
  );

  const maxSimilarity = Math.max(
    ...indices.map(({ similarity }) => similarity)
  );

  // Pick longest link from links with max similarity
  let nextLink = indices.filter(({ similarity }) => (
    similarity >= maxSimilarity
  )).map(({ index }) => (
    webpage.links[index]
  )).reduce((longest, next) => {
    const length = stringifyLink(next).length;
    return length > longest.length ? { link: next, length } : longest;
  }, { link: null as (Link | null), length: 0 }
  ).link;

  if (nextLink === null) {  // Pick best match
    nextLink = webpage.links[
      findIndexLevenshtein(
        searchUrl,
        webpage.links.map(({ href }) => href)
      )
    ];
  }

  return nextLink;
}

function* fetchNextWebpage(
  comicId: EntityId,
  mode: UpdateMode,
  current: Webpage,
  previous?: Webpage
) {
  let urls: string[];

  if (previous === undefined) {
    // Cluster links by current URL and sort by score
    const links = current.links.map(({ href }) => href);
    urls = getSortedCluster(current.url, links);
  } else {
    // Find 'next' link on previous page
    const nextLink = findNextLink(current.url, previous);

    // Sort URLs on current page by best match to 'next' link
    const links = current.links.map(stringifyLink);
    urls = getSortedCluster(stringifyLink(nextLink), links).map(link => {
      const start = link.indexOf('href="');
      const end = link.indexOf('"', start + 6);

      return link.substring(start + 6, end);  // Extract href
    });
  }

  urls = Array.from(new Set(urls));  // Only consider unique URLs

  // Go through URLs until we find one different from the current page
  for (let i = 0; i < urls.length; ++i) {
    yield put(updaterUpdated({
      id: comicId,
      changes: {
        running: true,
        request: { mode, progress: `Locating next page (#${i + 1})` }
      }
    }));

    yield delay(500);  // Throttle requests

    let response: WebpageResponse = yield call(fetchWebpage, urls[i]);
    if (response.state !== ResponseState.Success) {
      continue;
    }

    const next = response.webpage;
    const pageInUse: boolean = yield call(
      window.comicsApi.isPageInUse, next.url
    );

    if (pageInUse) {
      continue;  // Already have a page with this URL
    }

    // Make sure next webpage points back to current
    const links = next.links.map(({ href }) => href);
    const previousUrl = getSortedCluster(current.url, links)[0];

    if (previousUrl === undefined) {
      continue;  // Found nothing close to current url
    }

    // Fetch what should be the current webpage
    response = yield call(fetchWebpage, previousUrl);
    if (response.state !== ResponseState.Success) {
      continue;
    }

    if (response.webpage.url === current.url) {
      return next;
    }
  }
}

function* fetchNextImage(
  comicId: EntityId,
  mode: UpdateMode,
  webpage: Webpage,
  previousPage?: Page
) {
  let urls: string[];

  if (previousPage === undefined) {
    // Take all images
    urls = webpage.images.map(({ src }) => src);
  } else {  //  Find next image based on previous image URL
    const info: ImageInfo = yield call(
      window.comicsApi.getImageInfo, previousPage.id
    );

    // Cluster images
    urls = getSortedCluster(info.src, webpage.images.map(({ src }) => src));
  }

  // Fetch images
  yield put(updaterUpdated({
    id: comicId,
    changes: {
      running: true,
      request: { mode, progress: `Fetching images (${urls.length})` }
    }
  }));

  const response: ImageResponse = yield call(fetchImages, urls);
  if (response.state !== ResponseState.Success) {
    return;
  }

  const images = response.images.slice();
  if (previousPage === undefined) {  // Sort descending by size
    images.sort((a, b) => b.width * b.height - a.width * a.height);
  }

  // Go through images until we find one not used by any other page
  for (const image of images) {
    const inUse: boolean = yield call(
      window.comicsApi.isImageInUse, image.sha256
    );

    if (!inUse) {
      return image;
    }
  }
}

function* addPage(comicId: EntityId, page: Page) {
  const comic: Comic = yield select(selectComic(comicId));

  const updated = new Date();
  const selectedComic: EntityId | undefined = yield select(selectLastComicViewed);
  yield call(window.comicsApi.updateComicUpdated, comic.id, updated);

  const actions: Action[] = [];

  if (page.number === 0) {  // First page
    if (page.comicId === selectedComic) {
      actions.push(bookmarkUpdated({ page }));
    }
  }

  yield put(batchActions([
    ...actions,
    comicUpdated({ id: comic.id, changes: { updated } }),
    updaterPageAdded({ page })
  ]));
}

function* updateSinglePage(comicId: EntityId) {
  yield put(updaterUpdated({
    id: comicId,
    changes: {
      running: true,
      request: { mode: UpdateMode.SinglePage }
    }
  }));

  // Locate last page
  const { response, page }: FetchedPage = yield call(
    getStartingPage, comicId, UpdateMode.SinglePage
  );

  if (response.state !== ResponseState.Success) {
    return {  // Abort if starting node cannot be updated
      state: response.state,
      statusCode: response.statusCode
    };
  }

  const webpage = response.webpage;
  let nextWebpage: Webpage | undefined;

  if (page === null) {  // Next page is current page
    nextWebpage = webpage;
  } else {  // Fetch next page
    const previousWebpage: Webpage | undefined = yield call(
      fetchPreviousWebpage, comicId, page
    );

    nextWebpage = yield call(
      fetchNextWebpage,
      comicId,
      UpdateMode.SinglePage,
      webpage,
      previousWebpage
    );

    if (nextWebpage === undefined) {
      return {
        message: 'No new page found',
        state: ResponseState.Success
      };
    }
  }

  const image: DbWebImage | undefined = yield call(
    fetchNextImage,
    comicId,
    UpdateMode.SinglePage,
    nextWebpage,
    page === null ? undefined : page
  );

  if (image === undefined) {
    return {
      message: 'Unable to find suitable image',
      state: ResponseState.Success
    };
  }

  const newPage: Page = yield call(
    createPage,
    comicId,
    nextWebpage.url,
    image
  );

  yield call(addPage, comicId, newPage);

  return {
    message: `Successfully fetched page ${newPage.number + 1}`,
    state: ResponseState.Success
  };
}

function* updateMultiplePages(comicId: EntityId) {
  let pages: number = 0;
  let comic: Comic = yield select(selectComic(comicId));

  // Check new page limit
  let newPages: number = yield select(selectNewPages(comicId));
  if (comic.updates.limit !== -1 && newPages >= comic.updates.limit) {
    return {
      message: 'New page limit reached',
      state: ResponseState.Success
    };
  }

  yield put(updaterUpdated({
    id: comicId,
    changes: {
      running: true,
      request: { mode: UpdateMode.MultiplePages }
    }
  }));

  // Locate last node
  const { response, page }: FetchedPage = yield call(
    getStartingPage, comicId, UpdateMode.MultiplePages
  );

  if (response.state !== ResponseState.Success) {
    return {  // Abort if starting node cannot be updated
      state: response.state,
      statusCode: response.statusCode
    };
  }

  let currentPage = page;
  let previousWebpage: Webpage | undefined;
  let currentWebpage = response.webpage;

  if (currentPage !== null) {
    previousWebpage = yield call(
      fetchPreviousWebpage, comicId, currentPage
    );
  }

  while (true) {  // Loop until no new pages / new page limit hit
    let nextWebpage: Webpage | undefined;

    if (currentPage === null) {  // Next page is current page
      nextWebpage = currentWebpage;
    } else {  // Fetch next page
      nextWebpage = yield call(
        fetchNextWebpage,
        comicId,
        UpdateMode.MultiplePages,
        currentWebpage,
        previousWebpage
      );

      if (nextWebpage === undefined) {
        return {
          message: pages === 0 ?
            'No new pages found' :
            `Fetched ${pages} new page${pages === 1 ? '' : 's'}`,
          state: ResponseState.Success
        };
      }
    }

    const image: DbWebImage | undefined = yield call(
      fetchNextImage,
      comicId,
      UpdateMode.MultiplePages,
      nextWebpage,
      page === null ? undefined : page
    );

    if (image === undefined) {
      return {
        message: 'Unable to find suitable image',
        state: ResponseState.Success
      };
    }

    const nextPage: Page = yield call(
      createPage,
      comicId,
      nextWebpage.url,
      image
    );

    yield call(addPage, comicId, nextPage);
    ++pages;

    comic = yield select(selectComic(comicId));
    newPages = yield select(selectNewPages(comicId));

    if (comic.updates.limit !== -1 && newPages >= comic.updates.limit) {
      return {  // Reached new page limit
        message: `Fetched ${pages} new ${pages === 1 ? 'page' : 'pages'}`,
        state: ResponseState.Success
      };
    }

    yield put(updaterUpdated({  // Continue updating
      id: comicId,
      changes: {
        running: true,
        request: {
          mode: UpdateMode.MultiplePages,
          response: {
            message: `Fetching new pages (${pages})`,
            state: ResponseState.Success
          }
        }
      }
    }));

    currentPage = nextPage;
    previousWebpage = currentWebpage;
    currentWebpage = nextWebpage;

    yield delay(2000);  // Throttle
  }
}

function* onUpdaterStarted(comicId: EntityId, mode: UpdateMode) {
  // Check if updater is already running
  const updater: Updater = yield select(selectUpdater(comicId));
  if (updater.running) {
    return;  // Already running
  }

  let result: { success?: UpdateResponse } = {};

  try {
    result = yield race({
      success: call(
        mode === UpdateMode.SinglePage ? updateSinglePage : updateMultiplePages,
        comicId
      ),
      cancel: take((action: Action<any>) => {
        if (updaterStopped.match(action)) {
          const payloadAction = action as PayloadAction<{ comicId: EntityId }>;
          console.log(`updaterStopped: ${payloadAction.payload.comicId}`);
          console.log(`comicId: ${comicId}`);
          return payloadAction.payload.comicId === comicId;
        }

        return false;
      })
    });
  } finally {
    const { success } = result;

    yield put(updaterUpdated({
      id: comicId,
      changes: {
        running: false,
        request: {
          mode,
          response: success ?? { state: ResponseState.Canceled }
        }
      }
    }));

    if (mode === UpdateMode.MultiplePages) {
      yield put(comicUpdated({
        id: comicId,
        changes: { updated: new Date() }
      }));
    }
  }
}

export function* watchUpdaterStarted() {
  yield takeEvery(updaterStarted, ({ payload }) => (
    onUpdaterStarted(payload.comicId, payload.mode)
  ));
}

export default function* updaterSaga() {
  yield all([
    call(checkAutoUpdates),
    call(watchUpdaterStarted)
  ]);
}
