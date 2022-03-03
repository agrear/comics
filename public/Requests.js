const HttpAgent = require('agentkeepalive');
const { Mutex } = require('async-mutex');
const { app } = require('electron');
const got = require('got');
const Keyv = require('keyv');
const KeyvFile = require('keyv-file').KeyvFile;
const path = require('path');

const { HttpsAgent } = HttpAgent;

const cache = new Keyv({
  store: new KeyvFile({
    filename: path.join(app.getPath('userData'), 'cache.json')
  }),
  ttl: 24 * 60 * 60  // 24h
});

class CancelError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CancelError';
  }
}

class InvalidTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

class Requests {
  constructor() {
    this.mutex = new Mutex();
    this.requests = new Map();

    const isResponseOk = ({ request, statusCode }) => {
      const limitStatusCode = request.options.followRedirect ? 299 : 399;

      return statusCode === 304 || (
        statusCode >= 200 && statusCode <= limitStatusCode
      );
    };

    const options = {
      agent: {
        http: new HttpAgent(),
        https: new HttpsAgent()
      },
      cache,
      hooks: {
        afterResponse: [
          response => {
            if (isResponseOk(response)) {
              response.request.destroy();
            }

            return response;
          }
        ]
      },
      //http2: true,  // HTTP2 is still buggy
      timeout: 15000,
      headers: {
        'user-agent': `comics/${app.getVersion()} (https://github.com/agrear/comics)`
      }
    };

    this.instance = got.extend(options);
  }

  async create(token) {
    return this.mutex.runExclusive(() => {
      if (this.requests.has(token)) {
        throw new InvalidTokenError();
      }

      this.requests.set(token, []);
    });
  }

  async push(token, url) {
    return this.mutex.runExclusive(() => {
      if (!this.requests.has(token)) {
        throw new CancelError();
      }

      // https://github.com/sindresorhus/got/issues/1385#issuecomment-725685047
      const request = this.instance(url).on('request', req => {
        req.prependOnceListener('cacheableResponse', cacheableResponse => {
          const fix = () => {
            if (!cacheableResponse.req) {
              return;
            }

            cacheableResponse.complete = cacheableResponse.req.res.complete;
          };

          cacheableResponse.prependOnceListener('end', fix);
          fix();
        });
      });

      this.requests.get(token).push(request);

      return { request };
    });
  }

  async cancel(token) {
    return this.mutex.runExclusive(() => {
      if (this.requests.has(token)) {
        const requests = this.requests.get(token);
        requests.forEach(request => request.cancel());
        this.requests.delete(token);
      }
    });
  }

  async remove(token) {
    return this.mutex.runExclusive(() => {
      if (!this.requests.has(token)) {
        throw new InvalidTokenError();
      }

      this.requests.delete(token);
    });
  }
}

module.exports = {
  CancelError,
  InvalidTokenError,
  Requests
};
