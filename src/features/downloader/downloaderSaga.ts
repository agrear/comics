import { EntityId } from '@reduxjs/toolkit';
import { StatusCodes } from 'http-status-codes';
import { nanoid } from 'nanoid';
import {
  all,
  call,
  cancelled,
  put,
  race,
  take,
  takeLatest
} from 'redux-saga/effects';

import {
  downloaderFinished,
  downloaderStarted,
  downloaderStopped,
  ErroneousResponseState,
  Request,
  RequestType,
  ResponseState
} from './downloaderSlice';

export type ImageResponse = {
  state: ResponseState.Success,
  images: DbWebImage[]
} | {
  state: ErroneousResponseState,
  statusCode?: StatusCodes
};

export type WebpageResponse = {
  state: ResponseState.Success,
  webpage: Webpage
} | {
  state: ErroneousResponseState,
  statusCode?: StatusCodes
};

function createId(): string {
  return nanoid();
}

function getResponseState(error: string): ResponseState {
  switch (error) {
    case 'cancel':
      return ResponseState.Canceled;
    case 'timeout':
      return ResponseState.Timeout;
    default:
      return ResponseState.Error;
  }
}

export function* fetchImages(urls: string[]) {
  const token = createId();
  let response: DbImageResponse | undefined;

  try {
    response = yield call(window.comicsApi.fetchImages, urls, token);
  } finally {
    if ((yield cancelled()) as boolean) {
      yield call(window.comicsApi.cancelRequest, token);
      console.log('Canceled fetching node');
    }
  }

  if (response === undefined) {
    console.log('Unknown error');
    return { state: ResponseState.Error };
  }

  if (response.error !== undefined) {
    const { error, statusCode } = response;
    console.log(`${error}, status code: ${statusCode}`);
    return { state: getResponseState(error), statusCode };
  }

  return {
    state: ResponseState.Success,
    images: response.images
  };
}

function* downloadImages(
  comicId: EntityId,
  urls: string[],
  pageId?: EntityId | null
) {
  try {
    const response: ImageResponse = yield call(fetchImages, urls);

    if (response.state === ResponseState.Success) {
      yield put(downloaderFinished({
        state: ResponseState.Success,
        type: RequestType.Images,
        images: response.images,
        comicId,
        pageId
      }));
    } else {
      yield put(downloaderFinished({
        state: response.state,
        statusCode: response.statusCode,
        type: RequestType.Images,
        comicId,
        pageId
      }));
    }
  } finally {
    if ((yield cancelled()) as boolean) {
      yield put(downloaderFinished({
        state: ResponseState.Canceled,
        type: RequestType.Images,
        comicId,
        pageId
      }));
    }
  }
}

export function* fetchWebpage(url: string) {
  const token = createId();
  let response: DbWebpageResponse | undefined;

  try {
    response = yield call(window.comicsApi.fetchWebpage, url, token);
  } finally {
    if ((yield cancelled()) as boolean) {
      yield call(window.comicsApi.cancelRequest, token);
      console.log('Canceled fetching node');
    }
  }

  if (response === undefined) {
    console.log('Unknown error');
    return { state: ResponseState.Error };
  }

  if (response.error !== undefined) {
    const { error, statusCode } = response;
    console.log(`${error}, status code: ${statusCode}`);
    return { state: getResponseState(error), statusCode };
  }

  return {
    state: ResponseState.Success,
    webpage: response.webpage
  };
}

function* downloadWebpage(
  comicId: EntityId,
  url: string,
  pageId?: EntityId | null
) {
  try {
    const response: WebpageResponse = yield call(fetchWebpage, url);

    if (response.state === ResponseState.Success) {
      yield put(downloaderFinished({
        state: ResponseState.Success,
        type: RequestType.Webpage,
        webpage: response.webpage,
        comicId,
        pageId
      }));
    } else {
      yield put(downloaderFinished({
        state: response.state,
        statusCode: response.statusCode,
        type: RequestType.Webpage,
        comicId,
        pageId
      }));
    }
  } finally {
    if ((yield cancelled()) as boolean) {
      yield put(downloaderFinished({
        state: ResponseState.Canceled,
        type: RequestType.Webpage,
        comicId,
        pageId
      }));
    }
  }
}

function* onDownloaderStarted(request: Request) {
  if (request.type === RequestType.Images) {
    const { comicId, urls, pageId } = request;

    const { success } = yield race({
      success: call(downloadImages, comicId, urls, pageId),
      cancel: take((action: any) => action.type === downloaderStopped.type)
    });

    if (success) {
      console.log(`Fetched ${urls.length} images`);
    }
  } else if (request.type === RequestType.Webpage) {
    const { comicId, url, pageId } = request;

    const { success } = yield race({
      success: call(downloadWebpage, comicId, url, pageId),
      cancel: take((action: any) => action.type === downloaderStopped.type)
    });

    if (success) {
      console.log(`Fetched ${url}`);
    }
  }
}

export function* watchDownloaderStarted() {
  yield takeLatest(downloaderStarted, ({ payload }) => (
    onDownloaderStarted(payload)
  ));
}

export default function* downloaderSaga() {
  yield all([
    call(watchDownloaderStarted)
  ]);
}
