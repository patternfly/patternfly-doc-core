// Add custom jest matchers from jest-dom
import '@testing-library/jest-dom';

// Polyfill Response for API endpoint tests
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    body: any;
    status: number;
    statusText: string;
    headers: {
      _map: Map<string, string>;
      get: (key: string) => string | null;
    };

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || '';

      const headersMap = new Map<string, string>();
      this.headers = {
        _map: headersMap,
        get: (key: string) => headersMap.get(key) || null,
      };

      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((value, key) => {
            headersMap.set(key, value);
          });
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, value]) => {
            headersMap.set(key, value);
          });
        } else {
          Object.entries(init.headers).forEach(([key, value]) => {
            if (typeof value === 'string') {
              headersMap.set(key, value);
            }
          });
        }
      }
    }

    async json() {
      return JSON.parse(this.body as string);
    }

    async text() {
      return this.body as string;
    }
  } as any;
}
