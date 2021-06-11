const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('comicsApi', {
  cancelRequest: token => ipcRenderer.send('cancelRequest', token),
  copyToClipboard: text => ipcRenderer.send('copyToClipboard', text),
  deleteComic: comicId => ipcRenderer.send('deleteComic', comicId),
  deletePage: pageId => ipcRenderer.invoke('deletePage', pageId),
  fetchImages: async (urls, token) => (
    ipcRenderer.invoke('fetchImages', { urls, token })
  ),
  fetchWebpage: async (url, token) => (
    ipcRenderer.invoke('fetchWebpage', { url, token })
  ),
  getBookmark: async comicId => ipcRenderer.invoke('getBookmark', comicId),
  getComic: async comicId => ipcRenderer.invoke('getComic', comicId),
  getComics: async () => ipcRenderer.invoke('getComics'),
  getHistory: async () => ipcRenderer.invoke('getHistory'),
  getImage: async pageId => ipcRenderer.invoke('getImage', pageId),
  getImageInfo: async pageId => ipcRenderer.invoke('getImageInfo', pageId),
  getPage: async pageId => ipcRenderer.invoke('getPage', pageId),
  getPages: async comicId => ipcRenderer.invoke('getPages', comicId),
  getPreferences: async () => ipcRenderer.invoke('getPreferences'),
  insertComic: async (cover, meta) => (
    ipcRenderer.invoke('insertComic', { cover, meta })
  ),
  insertPage: async (comicId, url, imageSrc, image) => (
    ipcRenderer.invoke('insertPage', { comicId, url, imageSrc, image })
  ),
  isImageInUse: async sha256 => (
    ipcRenderer.invoke('isImageInUse', sha256)
  ),
  isPageInUse: async url => (
    ipcRenderer.invoke('isPageInUse', url)
  ),
  markComicAsRead: comicId => ipcRenderer.send('markComicAsRead', comicId),
  quit: () => ipcRenderer.send('quit'),
  setMinimizeToTray: minimizeToTray => (
    ipcRenderer.send('setMinimizeToTray', minimizeToTray)
  ),
  setOpenAtLogin: openAtLogin => (
    ipcRenderer.send('setOpenAtLogin', openAtLogin)
  ),
  setWindowMode: windowMode => ipcRenderer.invoke('setWindowMode', windowMode),
  toggleFullscreen: async () => ipcRenderer.invoke('toggleFullscreen'),
  updateBookmark: (comicId, pageNumber) => (
    ipcRenderer.send('updateBookmark', { comicId, pageNumber })
  ),
  updateComic: (comicId, cover, meta) => (
    ipcRenderer.send('updateComic', { comicId, cover, meta })
  ),
  updateComicAccessed: (comicId, date) => (
    ipcRenderer.send('updateComicAccessed', { comicId, date })
  ),
  updateComicBrightness: (comicId, brightness) => (
    ipcRenderer.send('updateComicBrightness', { comicId, brightness })
  ),
  updateComicLayout: (comicId, layout) => (
    ipcRenderer.send('updateComicLayout', { comicId, layout })
  ),
  updateComicUpdates: (comicId, updates) => (
    ipcRenderer.send('updateComicUpdates', { comicId, updates })
  ),
  updateComicUpdated: (comicId, date) => (
    ipcRenderer.send('updateComicUpdated', { comicId, date })
  ),
  updateHistory: comicId => ipcRenderer.send('updateHistory', comicId),
  updateImage: (pageId, imageSrc, image) => (
    ipcRenderer.send('updateImage', { pageId, imageSrc, image })
  ),
  updatePageAccessed: (pageId, accessed) => (
    ipcRenderer.send('updatePageAccessed', { pageId, accessed })
  ),
  updatePageUrl: async (pageId, url) => (
    ipcRenderer.send('updatePageUrl', { pageId, url })
  ),
  updatePageNumber: async (pageId, pageNumber) => (
    ipcRenderer.invoke('updatePageNumber', { pageId, pageNumber })
  )
});
