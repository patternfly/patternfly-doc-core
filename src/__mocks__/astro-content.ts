/**
 * Default mock for Astro's content collections module
 * Individual tests override this with jest.mock() for specific behavior
 */

export const getCollection = jest.fn(() => Promise.resolve([]))
