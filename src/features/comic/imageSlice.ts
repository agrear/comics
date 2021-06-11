import {
  createEntityAdapter,
  createSlice,
  EntityId,
  PayloadAction,
  Update
 } from '@reduxjs/toolkit';

import { RootState } from 'app/store';
import { freeObjectUrl } from 'utils';

export type Image = {
  id: EntityId;
  src: string,
  sha256: string,
  width: number;
  height: number;
  url: string;
};

export type WebImage = Omit<Image, 'id'>;

const imageAdapter = createEntityAdapter<Image>();

const imageSlice = createSlice({
  name: 'image',
  initialState: imageAdapter.getInitialState(),
  reducers: {
    imageAdded: imageAdapter.addOne,
    imageAddedMany: imageAdapter.addMany,
    imageRemoved(state, action: PayloadAction<EntityId>) {
      const image = state.entities[action.payload];
      if (image !== undefined) {
        freeObjectUrl(image.url);
      }

      imageAdapter.removeOne(state, action);
    },
    imageRemovedAll(state) {
      Object.values(state.entities).forEach(image => {
        if (image !== undefined) {
          freeObjectUrl(image.url);
        }
      });

      imageAdapter.removeAll(state);
    },
    imageRemovedMany(state, action: PayloadAction<EntityId[]>) {
      action.payload.forEach(id => {
        const image = state.entities[id];
        if (image !== undefined) {
          freeObjectUrl(image.url);
        }
      });

      imageAdapter.removeMany(state, action);
    },
    imageUpdated(state, action: PayloadAction<Update<Image>>) {
      const image = state.entities[action.payload.id];
      if (image !== undefined) {
        freeObjectUrl(image.url);
      }

      imageAdapter.updateOne(state, action);
    }
  }
});

export const {
  imageAdded,
  imageAddedMany,
  imageRemoved,
  imageRemovedAll,
  imageRemovedMany,
  imageUpdated
} = imageSlice.actions;

export const selectImage = (id?: EntityId) => (state: RootState) => {
  if (id === undefined) {
    return undefined;
  }

  return imageAdapter.getSelectors().selectById(state.image, id);
};

export const selectImages = (state: RootState) => (
  imageAdapter.getSelectors().selectAll(state.image)
);

export default imageSlice.reducer;
