import { createSlice, EntityId, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from 'app/store';

export type HistoryState = {
  comicId?: EntityId
};

const initialState: HistoryState = {
  comicId: undefined
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    comicLastViewedUpdated(state, action: PayloadAction<{
      comicId: EntityId
    }>) {
      state.comicId = action.payload.comicId;
    },
    historySet(state, action: PayloadAction<HistoryState>) {
      state.comicId = action.payload.comicId;
    }
  }
});

export const {
  comicLastViewedUpdated,
  historySet
} = historySlice.actions;

export const selectLastComicViewed = (state: RootState) => {
  return state.history.comicId;
};

export default historySlice.reducer;
