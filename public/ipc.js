const dataUriToBuffer = require('data-uri-to-buffer');
const { app, clipboard, ipcMain: ipc } = require('electron');
const got = require('got');
const path = require('path');

const { createDatabase } = require('./database');
const { createPreparedStatements } = require('./queries');
const { CancelError, InvalidTokenError, Requests } = require('./Requests');
const { store } = require('./store');
const { getWindow, windowHasFrame } = require('./window');
const { parse, parseImage } = require('./util');

const db = createDatabase(path.join(app.getPath('userData'), 'comics.db'));

const {
  deleteComic,
  deletePage,
  insertComic,
  insertPage,
  selectBookmark,
  selectComic,
  selectComics,
  selectImage,
  selectImageInfo,
  selectPage,
  selectPageIdByImageSha256,
  selectPageIdByUrl,
  selectPages,
  updateAllPagesNotAccessed,
  updateBookmark,
  updateComic,
  updateComicAccessed,
  updateComicBrightness,
  updateComicLayout,
  updateComicUpdates,
  updateComicUpdated,
  updateImage,
  updatePageAccessed,
  updatePageNumber,
  updatePageUrl
} = createPreparedStatements(db);

const requests = new Requests();

function registerIPC() {
  ipc.on('cancelRequest', async (event, token) => {
    await requests.cancel(token);
  });

  ipc.on('copyToClipboard', async (event, text) => {
    clipboard.writeText(text);
  });

  ipc.on('deleteComic', (event, comicId) => deleteComic(comicId));

  ipc.handle('deletePage', (event, pageId) => deletePage(pageId));

  ipc.handle('fetchImages', async (event, { urls, token }) => {
    try {
      await requests.create(token);
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        return { error: 'canceled' };
      }
    }

    const imageRequests = [];
    const images = [];

    for (let i = 0; i < urls.length; ++i) {
      const url = new URL(urls[i]);

      if (url.protocol === 'data:') {
        images.push({
          src: url.href,
          ...await parseImage(dataUriToBuffer(url.href))
        });

        continue;
      }

      try {  // Add image to download queue
        const { request } = await requests.push(token, url.href);
        imageRequests.push(request);
      } catch (error) {
        if (error instanceof CancelError) {
          return { error: 'canceled' };
        }
      }
    }

    let promises;
    try {  // Download images
      promises = await Promise.allSettled(imageRequests);
    } catch (error) {
      console.log(error);
      return { error: 'canceled' };
    }

    for (const promise of promises) {
      if (promise.status === 'rejected') {
        const { reason } = promise;
        console.log(`error fetching image: ${reason}`);

        if (reason instanceof CancelError) {
          console.log('canceled request');
          return { error: 'canceled' };
        } else if (reason instanceof InvalidTokenError) {
          console.log('invalid token');
          return { error: 'canceled' };
        } else if (reason instanceof got.CacheError) {
          console.log(reason.stack);
        } else if (reason instanceof got.TimeoutError) {
          return { error: 'timeout' };
        }
      } else {  // Success
        const { value: response } = promise;
        const image = await parseImage(response.rawBody);

        images.push({ src: response.url, ...image });
      }
    }

    try {
      await requests.remove(token);
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        return { error: 'canceled' };
      }
    }

    return { images };
  });

  ipc.handle('fetchWebpage', async (event, { url, token }) => {
    let response = null;

    try {
      await requests.create(token);
      const { request } = await requests.push(token, url);
      response = await request;
    } catch (error) {
      console.log(`error fetching webpage: ${error}`);

      if (error instanceof CancelError) {
        console.log('canceled request');
        return { error: 'canceled' };
      } else if (error instanceof InvalidTokenError) {
        console.log('invalid token');
        return { error: 'canceled' };
      } else if (error instanceof got.TimeoutError) {
        return { error: 'timeout' };
      } else if (error instanceof got.HTTPError) {
        const { response } = error;

        return {
          error: 'http',
          statusCode: response.statusCode
        };
      } else {  // Unknown error
        const { response } = error;

        if (response !== undefined) {
          return {
            error: error.toString(),
            statusCode: response.statusCode
          };
        }

        return { error: error.toString() };
      }
    }

    const webpage = parse(response.body, response.url);

    try {
      await requests.remove(token);
    } catch (error) {
      if (error instanceof InvalidTokenError) {
        return { error: 'canceled' };
      }
    }

    return { webpage };
  });

  ipc.handle('getBookmark', (event, comicId) => selectBookmark(comicId));

  ipc.handle('getComic', (event, comicId) => selectComic(comicId));

  ipc.handle('getComics', event => selectComics());

  ipc.handle('getHistory', event => store.get('history'));

  ipc.handle('getImage', (event, pageId) => selectImage(pageId));

  ipc.handle('getImageInfo', (event, pageId) => selectImageInfo(pageId));

  ipc.handle('getPage', (event, pageId) => selectPage(pageId));

  ipc.handle('getPages', (event, comicId) => selectPages(comicId));

  ipc.handle('getPreferences', event => store.get('preferences'));

  ipc.handle('insertComic', (event, { cover, meta }) => (
    insertComic({ cover, meta })
  ));

  ipc.handle('insertPage', (event, { comicId, url, imageSrc, image }) => (
    insertPage(comicId, url, imageSrc, image)
  ));

  ipc.handle('isImageInUse', (event, sha256) => (
    selectPageIdByImageSha256(sha256) !== undefined
  ));

  ipc.handle('isPageInUse', (event, url) => (
    selectPageIdByUrl(url) !== undefined
  ));

  ipc.on('markComicAsRead', (event, comicId) => {
    updateAllPagesNotAccessed(comicId);
  });

  ipc.on('quit', event => {
    app.quit();
  });

  ipc.on('setMinimizeToTray', (event, minimizeToTray) => {
    store.set('preferences.minimizeToTray', minimizeToTray);
  });

  ipc.on('setOpenAtLogin', (event, openAtLogin) => {
    store.set('preferences.openAtLogin', openAtLogin);

    app.setLoginItemSettings({
      openAtLogin,
      args: ['--hidden']
    });
  });

  ipc.handle('setWindowMode', (event, windowMode) => {
    const window = getWindow();
    let success = false;

    if (windowMode === 'windowed') {
      window.setFullScreen(false);

      if (windowHasFrame()) {
        success = true;
      }
    } else if (windowMode === 'borderless') {
      window.setFullScreen(false);

      if (!windowHasFrame()) {
        success = true;
      }
    } else if (windowMode === 'fullscreen') {
      window.setFullScreen(true);
      success = true;
    }

    store.set('preferences.windowMode', windowMode);

    return success;
  });

  ipc.handle('toggleFullscreen', (event) => {
    const window = getWindow();
    const windowMode = store.get('preferences.windowMode');
    let updatedWindowMode = null;

    if (windowMode === 'windowed' || windowMode === 'borderless') {
      window.setFullScreen(true);
      updatedWindowMode = 'fullscreen';
    } else if (windowMode === 'fullscreen') {
      window.setFullScreen(false);
      updatedWindowMode = windowHasFrame() ? 'windowed' : 'borderless';
    }

    store.set('preferences.windowMode', updatedWindowMode);

    return updatedWindowMode;
  });

  ipc.on('updateBookmark', (event, { comicId, pageNumber }) => {
    updateBookmark(comicId, pageNumber);
  });

  ipc.on('updateComic', (event, { comicId, cover, meta }) => {
    updateComic(comicId, cover, meta);
  });

  ipc.on('updateComicAccessed', (event, { comicId, date }) => {
    updateComicAccessed(comicId, date);
  });

  ipc.on('updateComicBrightness', (event, { comicId, brightness }) => {
    updateComicBrightness(comicId, brightness);
  });

  ipc.on('updateComicLayout', (event, { comicId, layout }) => {
    updateComicLayout(comicId, layout);
  });

  ipc.on('updateComicUpdates', (event, { comicId, updates }) => {
    updateComicUpdates(comicId, updates);
  });

  ipc.on('updateComicUpdated', (event, { comicId, date }) => {
    updateComicUpdated(comicId, date);
  });

  ipc.on('updateHistory', (event, comicId) => {
    store.set('history.comicId', comicId);
  });

  ipc.on('updateImage', (event, { pageId, imageSrc, image }) => {
    updateImage(pageId, imageSrc, image);
  });

  ipc.on('updatePageAccessed', (event, { pageId, accessed }) => {
    updatePageAccessed(pageId, accessed);
  });

  ipc.handle('updatePageNumber', (event, { pageId, pageNumber }) => (
    updatePageNumber(pageId, pageNumber)
  ));

  ipc.on('updatePageUrl', (event, { pageId, url }) => {
    updatePageUrl(pageId, url);
  });
}

module.exports = { registerIPC };
