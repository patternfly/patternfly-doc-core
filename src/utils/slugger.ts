import React from 'react'

// Should produce valid URLs and valid CSS ids
export const slugger = (children: React.ReactNode) => {
  const value = React.Children.toArray(children)
    .filter((child) => typeof child === 'string' || typeof child === 'number')
    .join('')
  return value
    .toLowerCase()
    .trim()
    .replace(/index$/, '')
    .replace(/\s/g, '-')
    .replace(/[^A-Za-z0-9.\-~]/g, '')
}
