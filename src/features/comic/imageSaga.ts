import { EntityId } from '@reduxjs/toolkit';
import { call } from 'redux-saga/effects';

import { Cover } from './comicSlice';
import { Image, WebImage } from './imageSlice';
import {
  createBufferFromObjectUrl,
  createObjectUrlFromBuffer,
  freeObjectUrl
} from 'utils';

export function convertToCover({ type, data, ...props }: DbCover): Cover {
  return { ...props, url: createObjectUrlFromBuffer(data, type) };
}

export function convertToImage({ type, data, ...props }: DbImage): Image {
  return {
    ...props,
    url: createObjectUrlFromBuffer(data, type)
  };
}

export function* loadImage(id: EntityId) {
  const dbImage: DbImage = yield call(window.comicsApi.getImage, id);

  return convertToImage(dbImage);
}

export function freeImage(image: Image): void {
  freeObjectUrl(image.url);
}

export function* updateImage(pageId: EntityId, image: WebImage) {
  yield call(
    window.comicsApi.updateImage,
    pageId,
    image.src,
    (yield call(createBufferFromObjectUrl, image.url)) as TypedBuffer
  );
}
