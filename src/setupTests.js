import '@testing-library/jest-dom'

// Try to import MSW server if available
let server
try {
    const mswModule = await import('./mocks/server')
    server = mswModule.server
    
    // Establish API mocking before all tests.
    beforeAll(() => server.listen())
    
    // Reset any request handlers that we may add during the tests,
    // so they don't affect other tests.
    afterEach(() => server.resetHandlers())
    
    // Clean up after the tests are finished.
    afterAll(() => server.close())
} catch (e) {
    // MSW not available, tests will use their own mocks
    console.log('MSW server not available, using test-specific mocks')
}
