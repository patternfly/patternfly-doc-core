// Add custom jest matchers from jest-dom
import '@testing-library/jest-dom';

// Polyfill Response for Node.js test environment
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(public body: any, public init?: ResponseInit) {}

    status = this.init?.status || 200;
    statusText = this.init?.statusText || '';
    headers = {
      entries: () => Object.entries(this.init?.headers || {}),
      get: (key: string) => {
        const headers = this.init?.headers || {};
        const value = (headers as any)[key];
        return value !== undefined ? value : null;
      },
    };

    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
    }

    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
  } as any;
}
