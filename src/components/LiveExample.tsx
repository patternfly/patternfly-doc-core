import React, { useState } from 'react'
import { convertToReactComponent } from '@patternfly/ast-helpers'
import * as reactCoreModule from '@patternfly/react-core'
import { ExampleToolbar } from './ExampleToolbar'
interface LiveExampleProps {
  src: string
}

function getLivePreview(editorCode: string) {
  const scope = { ...reactCoreModule, ...{ useState } }
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
    <>
      {livePreview}
      <ExampleToolbar
        originalCode={src}
        code={code}
        setCode={setCode}
        lang="ts"
        isFullscreen={false}
      />
    </>
  )
}
