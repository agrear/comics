import { createSlice, EntityId, PayloadAction } from '@reduxjs/toolkit';
import { StatusCodes } from 'http-status-codes';

import { RootState } from 'app/store';

export enum ResponseState {
  Canceled,
  Error,
  Success,
  Timeout
}

export type ErroneousResponseState = Exclude<ResponseState, ResponseState.Success>;

export enum RequestType {
  Images,
  Webpage
}

export type Request = {
  comicId: EntityId,
  pageId?: EntityId | null
} & ({
  type: RequestType.Images,
  urls: string[]
} | {
  type: RequestType.Webpage,
  url: string,
});

export type Response = {
  comicId: EntityId,
  pageId?: EntityId | null
} & (({
  state: ResponseState.Success
} & ({
  type: RequestType.Images,
  images: DbWebImage[]
} | {
  type: RequestType.Webpage,
  webpage: Webpage
})) | {
  state: ErroneousResponseState,
  statusCode?: StatusCodes,
  type: RequestType
});

export type Downloader = {
  running: boolean,
  request?: Request & {
    response?: {
      state: ResponseState,
      statusCode?: StatusCodes
    }
  }
};

const initialState: Downloader = {
  running: false
};

const downloaderSlice = createSlice({
  name: 'downloader',
  initialState,
  reducers: {
    downloaderFinished(state, action: PayloadAction<Response>) {
      state.running = false;
    },
    downloaderStarted(state, action: PayloadAction<Request>) {
      state.running = true;
      state.request = action.payload;
    },
    downloaderStopped(state) {
      state.running = false;
    }
  }
});

export const {
  downloaderFinished,
  downloaderStarted,
  downloaderStopped
} = downloaderSlice.actions;

export const selectDownloader = (state: RootState) => {
  return state.downloader;
};

export default downloaderSlice.reducer;
