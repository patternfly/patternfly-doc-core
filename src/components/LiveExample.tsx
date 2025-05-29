import React, { useState, Fragment, useRef, useEffect, createRef, useReducer } from 'react'
import { convertToReactComponent } from '@patternfly/ast-helpers'
import { ErrorBoundary } from 'react-error-boundary'
import * as reactCoreModule from '@patternfly/react-core'
import * as reactIconsModule from '@patternfly/react-icons'
import styles from "@patternfly/react-styles/css/components/_index"
import * as reactTokensModule from "@patternfly/react-tokens"
import { ExampleToolbar } from './ExampleToolbar'
interface LiveExampleProps {
  src: string
}

function fallbackRender({ error }: any) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  )
}

function getLivePreview(editorCode: string) {
  const scope = {
    ...reactCoreModule,
    ...reactIconsModule,
    styles,
    ...reactTokensModule,
    ...{ useState, Fragment, useRef, useEffect, createRef, useReducer },
  }
  const { code: transformedCode } = convertToReactComponent(editorCode)

  const componentNames = Object.keys(scope)
  const componentValues = Object.values(scope)

  const getPreviewComponent = new Function(
    'React',
    ...componentNames,
    transformedCode,
  )
  const PreviewComponent = getPreviewComponent(React, ...componentValues)

  return <PreviewComponent />
}

export const LiveExample = ({ src }: LiveExampleProps) => {
  const [code, setCode] = useState(src)
  const livePreview = getLivePreview(code)

  return (
    <ErrorBoundary fallbackRender={fallbackRender}>
      {livePreview}
      <ExampleToolbar
        originalCode={src}
        code={code}
        setCode={setCode}
        lang="ts"
        isFullscreen={false}
      />
    </ErrorBoundary>
  )
}
