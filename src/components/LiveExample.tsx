import React, { useState } from 'react'
import { ExampleToolbar } from '@patternfly/documentation-framework/components/example/exampleToolbar'
import { convertToReactComponent } from '@patternfly/ast-helpers'
import * as reactCoreModule from '@patternfly/react-core'
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
        code={code}
        setCode={setCode}
        lang="ts"
        isFullscreen={false}
      />
    </>
  )
}
