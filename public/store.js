const Store = require('electron-store');

const schema = {
  history: {
    type: 'object',
    properties: {
      comicId: { type: 'string' }
    },
    additionalProperties: false
  },
  preferences: {
    type: 'object',
    properties: {
      maximized: { type: 'boolean' },
      minimizeToTray: { type: 'boolean' },
      openAtLogin: { type: 'boolean' },
      windowMode: {
        type: 'string',
        enum: ['windowed', 'borderless', 'fullscreen']
      },
      windowSize: {
        type: 'object',
        properties: {
          width: { type: 'number' },
          height: { type: 'number' }
        },
        required: ['width', 'height'],
        additionalProperties: false
      }
    },
    /*required: [
      'maximized',
      'minimizeToTray',
      'openAtLogin',
      'windowMode',
      'windowSize'
    ],*/
    //additionalProperties: false
  }
};

const defaults = {
  history: {
    comicId: undefined
  },
  preferences: {
    maximized: false,
    minimizeToTray: false,
    openAtLogin: false,
    windowMode: 'windowed',
    windowSize: {
      width: 800,
      height: 640
    }
  }
};

const store = new Store({
  clearInvalidConfig: true,
  defaults,
  migrations: {
		'>=1.1.6': store => {
			store.delete('closeToTray');
			store.set('minimizeToTray', false);
		}
	},
  schema
});

module.exports = { store };
