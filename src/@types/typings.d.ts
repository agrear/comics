import { EntityId } from '@reduxjs/toolkit';
import { StatusCodes } from 'http-status-codes';

import { Comic, Meta, Updates } from 'features/comic/comicSlice';
import { Page } from 'features/comic/pageSlice';
import { HistoryState } from 'features/history/historySlice';
import { WindowMode } from 'features/settings/preferencesSlice';
import { Layout } from 'utils';

declare global {
  type DbComic = Omit<Comic, 'cover'> & {
    cover: DbCover
  };

  type TypedBuffer = {
    data: Buffer,
    type: string
  };

  type Dimensions = {
    width: number,
    height: number
  };

  type DbCover = TypedBuffer & Dimensions;

  type ImageInfo = Dimensions & {
    src: string,
    sha256: string
  };

  type DbWebImage = TypedBuffer & ImageInfo;

  type DbImage = DbWebImage & {
    id: EntityId
  };

  type DbImageResponse = {
    images: DbWebImage[],
    error: undefined,
    statusCode: undefined
  } | {
    error: string,
    statusCode?: StatusCodes
  };

  type Webpage = {
    url:string,
    links: {
      href: string,
      classes?: string,
      rel?: string,
      content?: string
    }[],
    images: {
      src: string
    }[],
    inlineFrames: {
      src: string
    }[]
  };

  type DbWebpageResponse = {
    webpage: Webpage,
    error: undefined,
    statusCode: undefined
  } | {
    error: string,
    statusCode?: StatusCodes
  };

  interface Window {
    comicsApi: {
      cancelRequest: (token: string) => void,
      copyToClipboard: (text: string) => void,
      deleteComic: (comicId: EntityId) => void,
      deletePage: (pageId: EntityId) => Promise<void>,
      fetchImages: (urls: string[], token: string) => Promise<DbImageResponse>,
      fetchWebpage: (url: string, token: string) => Promise<DbWebpageResponse>,
      getBookmark: (comicId: EntityId) => Promise<number>,
      getComic: (comicId: EntityId) => Promise<DbComic>,
      getComics: () => Promise<DbComic[]>,
      getHistory: () => Promise<HistoryState>,
      getImage: (pageId: EntityId) => Promise<DbImage>,
      getImageInfo: (pageId: EntityId) => Promise<ImageInfo>,
      getPage: (pageId: EntityId) => Promise<Page>,
      getPages: (comicId: EntityId) => Promise<Page[]>,
      getPreferences: () => Promise<Preferences>,
      insertComic: (cover: TypedBuffer, meta: Meta) => Promise<DbComic>,
      insertPage: (
        comicId: EntityId,
        url: string,
        imageSrc: string,
        image: TypedBuffer
      ) => Promise<Page>,
      isImageInUse: (sha256: string) => Promise<boolean>,
      isPageInUse: (url: string) => Promise<boolean>,
      markComicAsRead: (comicId: EntityId) => void,
      quit: () => void,
      setMinimizeToTray: (minimizeToTray: boolean) => void,
      setOpenAtLogin: (openAtLogin: boolean) => void,
      setWindowMode: (windowMode: WindowMode) => Promise<boolean>,
      toggleFullscreen: () => Promise<WindowMode>,
      updateBookmark: (comicId: EntityId, pageNumber: number) => void,
      updateComic: (comicId: EntityId, cover: Cover, meta: Meta) => void,
      updateComicAccessed: (comicId: EntityId, date: Date | null) => void,
      updateComicBrightness: (comicId: EntityId, brightness: number) => void,
      updateComicLayout: (comicId: EntityId, layout: Layout) => void,
      updateComicUpdates: (comicId: EntityId, updates: Updates) => void,
      updateComicUpdated: (comicId: EntityId, date: Date | null) => void,
      updateHistory: (comicId: EntityId) => void,
      updateImage: (
        pageId: EntityId,
        imageSrc: string,
        image: TypedBuffer
      ) => void,
      updatePageAccessed: (pageId: EntityId, accessed: Date) => void,
      updatePageNumber: (pageId: EntityId, pageNumber: number) => Promise<void>,
      updatePageUrl: (pageId: EntityId, url: string) => Promise<void>
    }
  }
}
