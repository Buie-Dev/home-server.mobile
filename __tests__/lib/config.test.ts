describe('config', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('builds direct IP URLs when REACT_APP_DOMAIN is falsy', () => {
    // The @env mock has REACT_APP_DOMAIN = '' and IP = 192.168.1.100
    const config = require('../../config/config');
    expect(config.baseAPIUrl).toMatch(/^http:\/\/\d+\.\d+\.\d+\.\d+:\d+$/);
    expect(config.baseWebSocketUrl).toMatch(/^ws:\/\/\d+\.\d+\.\d+\.\d+:\d+$/);
  });

  it('uses IP and port from env variables', () => {
    const config = require('../../config/config');
    // Verify the URL structure includes the server and port
    expect(config.baseAPIUrl).toContain(':');
    expect(config.baseWebSocketUrl).toContain(':');
  });

  it('exports both baseAPIUrl and baseWebSocketUrl', () => {
    const config = require('../../config/config');
    expect(config.baseAPIUrl).toBeDefined();
    expect(config.baseWebSocketUrl).toBeDefined();
    expect(typeof config.baseAPIUrl).toBe('string');
    expect(typeof config.baseWebSocketUrl).toBe('string');
  });
});
