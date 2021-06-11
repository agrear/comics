import {
  createAction,
  createSlice,
  EntityId,
  PayloadAction
} from '@reduxjs/toolkit';
import { StatusCodes } from 'http-status-codes';

import { RootState } from 'app/store';
import { Page } from '../comic/comicSlice';
import { WebImage } from '../comic/imageSlice';
import { freeObjectUrl } from 'utils';

export type Navigation =
  'viewPages' |
  'showOptions' |
  'returningToOptions' |
  'selectWebpage' |
  'selectImage' |
  'editPageNumber' |
  'deletePage';

export type WebpageHistory = Webpage[];

export type Explorer = {
  comicId: EntityId | null,
  navigation: Navigation,
  webpageHistory: WebpageHistory,
  webpageImages: WebImage[] | null,
  selectedPage?: Page | null,
  statusCode?: StatusCodes
};

const initialState: Explorer = {
  comicId: null,
  navigation: 'viewPages',
  webpageHistory: [],
  webpageImages: null
};

const freeImages = (images: Explorer['webpageImages']) => {
  if (images !== null) {
    images.forEach(image => freeObjectUrl(image.url));
  }
};

const explorerSlice = createSlice({
  name: 'explorer',
  initialState,
  reducers: {
    deletePageSelected(state) {
      state.navigation = 'deletePage';
    },
    deletePageCanceled(state) {
      state.navigation = 'returningToOptions';
    },
    editPageNumberCanceled(state) {
      state.navigation = 'returningToOptions';
    },
    editPageNumberSelected(state) {
      state.navigation = 'editPageNumber';
    },
    explorerClosed(state, action: PayloadAction<{ comicId: EntityId }>) {
      freeImages(state.webpageImages);

      state.comicId = null;
      state.selectedPage = undefined;
      state.webpageImages = null;
      state.webpageHistory = [];
      state.selectedPage = undefined;
      state.statusCode = undefined;
    },
    explorerOpened(
      state,
      action: PayloadAction<{ comicId: EntityId, index: number }>
    ) {
      state.comicId = action.payload.comicId;
      state.navigation = 'viewPages';
    },
    imageSelected(
      state,
      action: PayloadAction<{ page: Page, image: WebImage }>
    ) {
      state.navigation = 'returningToOptions';
    },
    imagesUpdated(state, action: PayloadAction<WebImage[]>) {
      freeImages(state.webpageImages);

      state.webpageImages = action.payload;
    },
    navigatedToOptions(state) {
      state.navigation = 'showOptions';
    },
    newPageCanceled(state) {
      state.navigation = 'viewPages';
    },
    newPageSelected(
      state,
      action: PayloadAction<{ comicId: EntityId, pageNumber: number }>
    ) {
      state.navigation = 'selectWebpage';
      state.selectedPage = null;
    },
    pageDeleted(state, action: PayloadAction<Page>) {
      freeImages(state.webpageImages);

      state.navigation = 'viewPages';
      state.selectedPage = undefined;
      state.webpageHistory = [];
      state.webpageImages = null;
      state.statusCode = undefined;
    },
    pageDeselected(state) {
      freeImages(state.webpageImages);

      state.navigation = 'viewPages';
      state.selectedPage = undefined;
      state.webpageHistory = [];
      state.webpageImages = null;
      state.statusCode = undefined;
    },
    pageNumberUpdated(
      state,
      action: PayloadAction<{ page: Page, pageNumber: number }>
    ) {
      state.navigation = 'returningToOptions';
      state.selectedPage = {
        ...action.payload.page,
        number: action.payload.pageNumber
      };
    },
    pageSelected(state, action: PayloadAction<Page>) {
      state.navigation = 'showOptions';
      state.selectedPage = action.payload;
    },
    previousWebpageSelected(state) {
      state.webpageHistory.pop();
    },
    selectImageCanceled(state) {
      state.navigation = 'returningToOptions';
    },
    selectImageSelected(state) {
      state.navigation = 'selectImage';
    },
    selectedPageUpdated(state, action: PayloadAction<Page>) {
      state.selectedPage = action.payload;
    },
    selectWebpageCanceled(state) {
      state.navigation = 'returningToOptions';
    },
    selectWebpageSelected(state) {
      state.navigation = 'selectWebpage';
    },
    statusCodeUpdated(state, action: PayloadAction<StatusCodes | undefined>) {
      state.statusCode = action.payload;
    },
    webpageHistoryUpdated(state, action: PayloadAction<WebpageHistory>) {
      state.webpageHistory = action.payload;
    },
    webpageSelected(
      state,
      action: PayloadAction<{ comicId: EntityId, webpage: Webpage }>
    ) {
      state.navigation = 'selectImage';
    },
    webpageUpdated(state, action: PayloadAction<{ page: Page, url: string }>) {
      state.navigation = 'returningToOptions';
    }
  }
});

export const {
  deletePageSelected,
  deletePageCanceled,
  editPageNumberCanceled,
  editPageNumberSelected,
  explorerClosed,
  explorerOpened,
  imageSelected,
  imagesUpdated,
  navigatedToOptions,
  newPageCanceled,
  newPageSelected,
  pageDeleted,
  pageDeselected,
  pageNumberUpdated,
  pageSelected,
  previousWebpageSelected,
  selectImageCanceled,
  selectImageSelected,
  selectWebpageCanceled,
  selectWebpageSelected,
  selectedPageUpdated,
  statusCodeUpdated,
  webpageHistoryUpdated,
  webpageSelected,
  webpageUpdated
} = explorerSlice.actions;

export const explorerViewUpdated = createAction<{
  comicId: EntityId, index: number, range: number
}>('explorer/viewUpdated');

export const newPageAdded = createAction<{
  comicId: EntityId, url: string, image: WebImage }>
('explorer/newPageAdded');

export const urlSelected = createAction<{
  url: string, comicId: EntityId, pageId?: EntityId | null
}>('explorer/urlSelected');

export const selectExplorerId = (state: RootState) => state.explorer.comicId;

export const selectWebpageImages = (state: RootState) => (
  state.explorer.webpageImages
);

export const selectNavigation = (state: RootState) => (
  state.explorer.navigation
);

export const selectSelectedPage = (state: RootState) => (
  state.explorer.selectedPage
);

export const selectStatusCode = (state: RootState) => (
  state.explorer.statusCode
);

export const selectWebpageHistory = (state: RootState) => (
  state.explorer.webpageHistory
);

export default explorerSlice.reducer;
