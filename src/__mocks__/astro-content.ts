// Mock for astro:content module
// This is a virtual module in Astro, so we need to provide a mock for Jest

export const getCollection = jest.fn();
export const getEntry = jest.fn();
export const getEntries = jest.fn();
