import { Content as PFContent } from '@patternfly/react-core'
import { ReactNode } from 'react'

export const h1 = ({ children }: { children: ReactNode }) => (
  <PFContent component="h1">{children}</PFContent>
)
export const h2 = ({ children }: { children: ReactNode }) => (
  <PFContent component="h2">{children}</PFContent>
)
export const h3 = ({ children }: { children: ReactNode }) => (
  <PFContent component="h3">{children}</PFContent>
)
export const h4 = ({ children }: { children: ReactNode }) => (
  <PFContent component="h4">{children}</PFContent>
)
export const h5 = ({ children }: { children: ReactNode }) => (
  <PFContent component="h5">{children}</PFContent>
)
export const h6 = ({ children }: { children: ReactNode }) => (
  <PFContent component="h6">{children}</PFContent>
)

export const p = ({ children }: { children: ReactNode }) => (
  <PFContent component="p">{children}</PFContent>
)
export const a = ({ children }: { children: ReactNode }) => (
  <PFContent component="a">{children}</PFContent>
)
export const small = ({ children }: { children: ReactNode }) => (
  <PFContent component="small">{children}</PFContent>
)

export const blockquote = ({ children }: { children: ReactNode }) => (
  <PFContent component="blockquote">{children}</PFContent>
)
export const pre = ({ children }: { children: ReactNode }) => (
  <PFContent component="pre">{children}</PFContent>
)
export const hr = ({ children }: { children: ReactNode }) => (
  <PFContent component="hr">{children}</PFContent>
)

export const ul = ({ children }: { children: ReactNode }) => (
  <PFContent component="ul">{children}</PFContent>
)
export const ol = ({ children }: { children: ReactNode }) => (
  <PFContent component="ol">{children}</PFContent>
)
export const dl = ({ children }: { children: ReactNode }) => (
  <PFContent component="dl">{children}</PFContent>
)
export const li = ({ children }: { children: ReactNode }) => (
  <PFContent component="li">{children}</PFContent>
)

export const dt = ({ children }: { children: ReactNode }) => (
  <PFContent component="dt">{children}</PFContent>
)
export const dd = ({ children }: { children: ReactNode }) => (
  <PFContent component="dd">{children}</PFContent>
)
