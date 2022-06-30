/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'comics.reader',
  productName: 'Comics',
  artifactName: '${name}-${version}-${os}-${arch}-setup.${ext}',
  directories: {
    output: 'dist',
    buildResources: 'build'
  },
  files: [
    'build/**'
  ],
  nsis: {
    oneClick: false,
    perMachine: false,
    createDesktopShortcut: false,
    createStartMenuShortcut: true,
    runAfterFinish: false
  },
  win: {
    target: {
      target: 'nsis',
      arch: 'x64'
    }
  }
};

module.exports = config;
