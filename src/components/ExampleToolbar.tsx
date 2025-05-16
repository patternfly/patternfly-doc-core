// TODO remove this component it is not good and I don't like that I have to add it

import React from 'react'
import { Button, Form, Tooltip } from '@patternfly/react-core'
import {
  CodeEditor,
  CodeEditorControl,
  Language,
} from '@patternfly/react-code-editor'
import { convertToJSX } from '@patternfly/ast-helpers'
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon'
import CodepenIcon from '@patternfly/react-icons/dist/esm/icons/codepen-icon'
import CopyIcon from '@patternfly/react-icons/dist/esm/icons/copy-icon'
import CodeIcon from '@patternfly/react-icons/dist/esm/icons/code-icon'
import AngleDoubleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-double-right-icon'
import ReplyAllIcon from '@patternfly/react-icons/dist/esm/icons/reply-all-icon'

const copy = (textToCopy: string) => {
  navigator.clipboard.writeText(textToCopy)
}

interface TrackEventValue {
  event_category: string
  event_label: string
  value?: number
}

interface WindowWithGtag extends Window {
  gtag?: (type: string, name: string, value: TrackEventValue) => void
}
const _window = window as WindowWithGtag
/**
 * Sends network call using Google Analytic's gtag function
 * https://developers.google.com/analytics/devguides/collection/gtagjs/events#send_events
 *
 * @param name {string} - The value that will appear as the event action in Google Analytics Event reports.
 * @param eventCategory {string} - The category of the event.
 * @param eventLabel {string} - The label of the event.
 * @param [value] {number} - An optional non-negative integer that will appear as the event value.
 */
const trackEvent = (
  name: string,
  eventCategory: string,
  eventLabel: string,
  value?: number,
) => {
  value ||= 0
  if (_window?.gtag) {
    _window?.gtag('event', name, {
      // eslint-disable-next-line camelcase
      event_category: eventCategory,
      // eslint-disable-next-line camelcase
      event_label: eventLabel,
      // Optional non-negative integer
      ...(value >= 0 && { value }),
    })
  }
}

function getLanguage(lang: string) {
  if (lang === 'js') {
    return Language.javascript
  } else if (lang === 'ts') {
    return Language.typescript
  }

  return lang as Language
}

interface ExampleToolbarProps {
  fullscreenLink?: string
  codeBoxParams?: any
  lang: string
  isFullscreen?: boolean
  originalCode: string
  code: string
  setCode: (code: string) => void
  exampleTitle?: string
}

export const ExampleToolbar = ({
  // Link to fullscreen example page (each example has one)
  fullscreenLink,
  // Params to pass to codesandbox
  codeBoxParams,
  // Language of code
  lang,
  // Whether the example is fullscreen only
  isFullscreen,
  // Original version of the code
  originalCode,
  // Current code in editor
  code,
  // Callback to set code in parent component
  setCode,
  // Title of example used in creating unique labels
  exampleTitle,
}: ExampleToolbarProps) => {
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)
  const [isCopied, setCopied] = React.useState(false)

  const copyLabel = 'Copy code to clipboard'
  const languageLabel = `Toggle ${lang.toUpperCase()} code`
  const codesandboxLabel = 'Open example in CodeSandbox'
  const fullscreenLabel = 'Open example in new window'
  const convertLabel = 'Convert example from Typescript to JavaScript'
  const undoAllLabel = 'Undo all changes'

  const copyAriaLabel = `Copy ${exampleTitle} example code to clipboard`
  const languageAriaLabel = `Toggle ${lang.toUpperCase()} code in ${exampleTitle} example`
  const codesandboxAriaLabel = `Open ${exampleTitle} example in CodeSandbox`
  const fullscreenAriaLabel = `Open ${exampleTitle} example in new window`
  const convertAriaLabel = `Convert ${exampleTitle} example from Typescript to JavaScript`
  const undoAllAriaLabel = `Undo all changes to ${exampleTitle}`

  const editorControlProps = {
    className: 'ws-code-editor-control',
  }

  const commonTooltipProps = {
    exitDelay: 300,
    maxWidth: 'var(--ws-code-editor--tooltip--MaxWidth)',
  }

  const copyCode = () => {
    copy(code)
    setCopied(true)
  }

  const customControls = (
    <React.Fragment>
      <CodeEditorControl
        icon={
          <React.Fragment>
            <CodeIcon />
            {' ' + lang.toUpperCase()}
          </React.Fragment>
        }
        onClick={() => {
          setIsEditorOpen(!isEditorOpen)
          // 1 === expand code, 0 === collapse code
          trackEvent(
            'code_editor_control_click',
            'click_event',
            'TOGGLE_CODE',
            isEditorOpen ? 0 : 1,
          )
        }}
        tooltipProps={{
          content: languageLabel,
          ...commonTooltipProps,
        }}
        aria-label={languageAriaLabel}
        aria-expanded={isEditorOpen}
        {...editorControlProps}
      />
      <Tooltip
        content={<div>{isCopied ? 'Code copied' : copyLabel}</div>}
        maxWidth={(editorControlProps as any)?.maxWidth}
        exitDelay={isCopied ? 300 : 1600}
        onTooltipHidden={() => setCopied(false)}
      >
        <Button
          onClick={() => {
            copyCode()
            trackEvent('code_editor_control_click', 'click_event', 'COPY_CODE')
          }}
          variant="plain"
          aria-label={copyAriaLabel}
          className={editorControlProps.className}
        >
          <CopyIcon />
        </Button>
      </Tooltip>
      {codeBoxParams && (
        <Form
          aria-label={`${codesandboxAriaLabel} form`}
          action="https://codesandbox.io/api/v1/sandboxes/define"
          method="POST"
          target="_blank"
          style={{ display: 'inline-block' }}
        >
          <Tooltip
            content={codesandboxLabel}
            maxWidth={(editorControlProps as any).maxWidth}
          >
            <Button
              aria-label={codesandboxAriaLabel}
              variant="plain"
              type="submit"
              onClick={() => {
                trackEvent(
                  'code_editor_control_click',
                  'click_event',
                  'CODESANDBOX_LINK',
                )
              }}
              className={editorControlProps.className}
            >
              <CodepenIcon />
            </Button>
          </Tooltip>
          <input type="hidden" name="parameters" value={codeBoxParams} />
        </Form>
      )}
      {fullscreenLink && (
        <CodeEditorControl
          component="a"
          icon={<ExternalLinkAltIcon />}
          href={fullscreenLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={fullscreenAriaLabel}
          tooltipProps={{
            content: fullscreenLabel,
            ...commonTooltipProps,
          }}
          onClick={() => {
            trackEvent(
              'code_editor_control_click',
              'click_event',
              'FULLSCREEN_LINK',
            )
          }}
          {...editorControlProps}
        />
      )}
      {isEditorOpen && lang === 'ts' && (
        <CodeEditorControl
          icon={
            <React.Fragment>
              {'TS '}
              <AngleDoubleRightIcon />
              {' JS'}
            </React.Fragment>
          }
          aria-label={convertAriaLabel}
          tooltipProps={{
            content: convertLabel,
            ...commonTooltipProps,
          }}
          onClick={() => {
            setCode(convertToJSX(code).code)
            trackEvent('code_editor_control_click', 'click_event', 'TS_TO_JS')
          }}
          {...editorControlProps}
        />
      )}
      {code !== originalCode && (
        <CodeEditorControl
          icon={<ReplyAllIcon />}
          aria-label={undoAllAriaLabel}
          tooltipProps={{
            content: undoAllLabel,
            ...commonTooltipProps,
          }}
          onClick={() => {
            setCode(originalCode)
            trackEvent('code_editor_control_click', 'click_event', 'RESET_CODE')
          }}
          {...editorControlProps}
        />
      )}
    </React.Fragment>
  )

  // TODO: check if worth adding react, patternfly, and example types
  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.typescript.languageservicedefaults.html#addextralib
  const onEditorDidMount = (_editor: any, monaco: any) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: true,
      ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
    })
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true,
      onlyVisible: true,
    })
  }

  return (
    <CodeEditor
      customControls={customControls}
      showEditor={isEditorOpen}
      language={getLanguage(lang)}
      height="400px"
      code={code}
      onChange={(newCode) => setCode(newCode)}
      onEditorDidMount={onEditorDidMount}
      isReadOnly={isFullscreen}
      className={`${isEditorOpen ? 'ws-example-code-expanded ' : ''}ws-code-editor`}
      isHeaderPlain
    />
  )
}
