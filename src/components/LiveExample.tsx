import React, {
  useState,
  Fragment,
  useRef,
  useEffect,
  createRef,
  useReducer,
} from 'react'
import { convertToReactComponent } from '@patternfly/ast-helpers'
import { ErrorBoundary } from 'react-error-boundary'
import * as reactCoreModule from '@patternfly/react-core'
import * as reactIconsModule from '@patternfly/react-icons'
import styles from '@patternfly/react-styles/css/components/_index'
import * as reactTokensModule from '@patternfly/react-tokens'
import { ExampleToolbar } from './ExampleToolbar'

interface LiveExampleProps {
  src?: string
  html?: string
  isFullscreenPreview?: boolean
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

export const LiveExample = ({
  src,
  html,
  isFullscreenPreview,
}: LiveExampleProps) => {
  const inputCode = src || html || ''
  const [code, setCode] = useState(inputCode)

  let livePreview = null
  let lang = 'ts'
  if (html) {
    livePreview = (
      <div
        className={`ws-preview-html ${isFullscreenPreview && 'pf-v6-u-h-100'}`}
        dangerouslySetInnerHTML={{ __html: code }}
      />
    )
    lang = 'html'
  } else {
    livePreview = getLivePreview(code)
    lang = 'ts'
  }

  return (
    <ErrorBoundary fallbackRender={fallbackRender}>
      {livePreview}
      <ExampleToolbar
        originalCode={inputCode}
        code={code}
        setCode={setCode}
        lang={lang}
        isFullscreen={false}
      />
    </ErrorBoundary>
  )
}
