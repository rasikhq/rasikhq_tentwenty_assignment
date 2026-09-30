import { setupServer } from 'msw/node';

/**
 * Fakes TMDb at the HTTP boundary. It starts with no handlers: each test adds the endpoints
 * it uses with server.use(), and any other request fails the test.
 */
export const server = setupServer();
