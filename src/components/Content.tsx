import { Content as PFContent } from "@patternfly/react-core"
import { ReactNode } from "react"

export const h1 = ({children}: {children: ReactNode}) => <PFContent component="h1">{children}</PFContent>
export const h2 = ({children}: {children: ReactNode}) => <PFContent component="h2">{children}</PFContent>
export const h3 = ({children}: {children: ReactNode}) => <PFContent component="h3">{children}</PFContent>
export const h4 = ({children}: {children: ReactNode}) => <PFContent component="h4">{children}</PFContent>
export const h5 = ({children}: {children: ReactNode}) => <PFContent component="h5">{children}</PFContent>
export const h6 = ({children}: {children: ReactNode}) => <PFContent component="h6">{children}</PFContent>

