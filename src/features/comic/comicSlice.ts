import {
  createAction,
  createEntityAdapter,
  createSlice,
  EntityId,
  PayloadAction,
  Update
} from '@reduxjs/toolkit';

import { RootState } from 'app/store';
import { freeObjectUrl, Layout } from 'utils';

export type Cover = {
  width: number,
  height: number,
  url: string
};

export type Meta = {
  url: string,
  author: string,
  title: string,
  synopsis: string | null,
  tags: string[]
};

export type Updates = {
  enabled: boolean,
  interval: number,
  limit: number
};

export type Page = {
  id: EntityId,
  url: string,
  number: number,
  accessed: Date | null,
  modified: Date,
  comicId: EntityId
};

export type Comic = Meta & {
  id: EntityId,
  cover: Cover,
  brightness: number,
  layout: Layout,
  bookmark: number,
  updates: Updates,
  accessed: Date | null,
  created: Date,
  updated: Date | null,
  pages: Page[]
};

const comicAdapter = createEntityAdapter<Comic>();

const comicSlice = createSlice({
  name: 'comic',
  initialState: comicAdapter.getInitialState(),
  reducers: {
    comicAdded: comicAdapter.addOne,
    comicAllSet: comicAdapter.setAll,
    comicRemoved(state, action: PayloadAction<EntityId>) {
      const id = action.payload;
      const comic = state.entities[id];
      if (comic !== undefined) {
        freeObjectUrl(comic.cover.url);
      }

      comicAdapter.removeOne(state, action);
    },
    comicUpdated(state, action: PayloadAction<Update<Comic>>) {
      if (action.payload.changes.cover !== undefined) {
        const comic = state.entities[action.payload.id];
        if (comic !== undefined) {
          freeObjectUrl(comic.cover.url);
        }
      }

      comicAdapter.updateOne(state, action);
    }
  }
});

export const {
  comicAdded,
  comicAllSet,
  comicRemoved,
  comicUpdated
} = comicSlice.actions;

export const bookmarkUpdated = createAction<{ page: Page }>(
  'comic/bookmarkUpdated'
);

export const comicBrightnessUpdated = createAction<{
  comicId: EntityId, brightness: number
}>('comic/brightnessUpdated');

export const comicClosed = createAction<{ id: EntityId }>('comic/closed');

export const comicDeleted = createAction<{ id: EntityId }>('comic/deleted');

export type ComicEditFormState = Meta & {
  id?: EntityId,
  cover: { url: string }
};

export const comicEditFormSubmitted = createAction<ComicEditFormState>(
  'comic/editFormSubmitted'
);

export const comicLayoutUpdated = createAction<{
  comicId: EntityId, layout: Partial<Layout>
}>('comic/layoutUpdated');

export const comicMarkedAsRead = createAction<{ comicId: EntityId }>(
  'comic/markedAsRead'
);

export const comicOpened = createAction<{ id: EntityId }>('comic/opened');

export const comicUpdatesUpdated = createAction<{
  comicId: EntityId, updates: Partial<Updates>
}>('comic/updatesUpdated');

export const selectComic = (id?: EntityId) => (state: RootState) => {
  if (id === undefined) {
    return undefined;
  }

  return comicAdapter.getSelectors().selectById(state.comic, id);
};

export const selectComics = (state: RootState) => (
  comicAdapter.getSelectors().selectAll(state.comic)
);

export const selectComicIds = (state: RootState) => (
  comicAdapter.getSelectors().selectIds(state.comic)
);

export const selectNewPages = (id?: EntityId) => (state: RootState) => {
  if (id === undefined) {
    return undefined;
  }

  const pages = comicAdapter.getSelectors().selectById(state.comic, id)?.pages;

  return pages?.filter(({ accessed }) => accessed === null)?.length ?? 0;
};

export default comicSlice.reducer;
