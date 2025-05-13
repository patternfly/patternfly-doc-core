import { debounce, List, ListItem, Stack } from '@patternfly/react-core'
import { Table, Thead, Th, Tr, Tbody, Td } from '@patternfly/react-table'
import { useState } from 'react'
import LevelUpAltIcon from '@patternfly/react-icons/dist/esm/icons/level-up-alt-icon'
import * as tokensModule from '@patternfly/react-tokens/dist/esm/componentIndex'
import React from 'react'
import { CSSSearch } from './CSSSearch'
import { AutoLinkHeader } from './AutoLinkHeader'

type Value = {
  name: string
  value: string
  values?: string[]
}

type FileList = {
  [key: string]: {
    name: string
    value: string
    values?: Value[]
  }
}

type List = {
  selector: string
  property: string
  token: string
  value: string
  values?: string[]
}

type FilteredRows = {
  cells: React.ReactNode[]
  isOpen?: boolean
  details?: { parent: number; fullWidth: boolean; data: React.ReactNode }
}

interface CSSTableProps extends React.HTMLProps<HTMLDivElement> {
  cssPrefix: string
  hideSelectorColumn?: boolean
  selector?: string
  debounceLength?: number
  autoLinkHeader?: boolean
}

const isColorRegex = /^(#|rgb)/
const mappingAsList = (property: string, values: string[]) => (
  <List isPlain>
    <ListItem>{property}</ListItem>
    {values.map((entry: string) => (
      <ListItem key={entry} icon={<LevelUpAltIcon className="rotate-90-deg" />}>
        {entry}
      </ListItem>
    ))}
  </List>
)

const flattenList = (files: FileList[]) => {
  const list = [] as List[]
  files.forEach((file) => {
    Object.entries(file).forEach(([selector, values]) => {
      if (values !== undefined) {
        Object.entries(values).forEach(([key, val]) => {
          if (typeof val === 'object' && val !== null && 'name' in val) {
            const v = val as unknown as Value
            list.push({
              selector,
              property: v.name,
              token: key,
              value: v.value,
              values: v.values,
            })
          }
        })
      }
    })
  })
  return list
}

export const CSSTable: React.FunctionComponent<CSSTableProps> = ({
  cssPrefix,
  hideSelectorColumn = false,
  selector,
  debounceLength = 500,
  autoLinkHeader,
}) => {
  const prefixToken = cssPrefix.replace('pf-v6-', '').replace(/-+/g, '_')

  const applicableFiles = Object.entries(tokensModule)
    .filter(([key, _val]) => prefixToken === key)
    .sort(([key1], [key2]) => key1.localeCompare(key2))
    .map(([_key, val]) => {
      if (selector) {
        return {
          selector: (val as Record<string, any>)[selector],
        }
      }
      return val
    })

  const flatList = flattenList(applicableFiles as any)

  const getFilteredRows = (searchRE?: RegExp) => {
    const newFilteredRows = [] as FilteredRows[]
    let rowNumber = -1
    flatList.forEach((row) => {
      const { selector, property, value, values } = row
      const passes =
        !searchRE ||
        searchRE.test(selector) ||
        searchRE.test(property) ||
        searchRE.test(value) ||
        (values && searchRE.test(JSON.stringify(values)))
      if (passes) {
        const rowKey = `${selector}_${property}`
        const isColor = isColorRegex.test(value)
        const cells = [
          hideSelectorColumn ? [] : [selector],
          property,
          <div key={rowKey}>
            <div
              key={`${rowKey}_1`}
              className="pf-v6-l-flex pf-m-space-items-sm"
            >
              {isColor && (
                <div
                  key={`${rowKey}_2`}
                  className="pf-v6-l-flex pf-m-column pf-m-align-self-center"
                >
                  <span
                    className="circle"
                    style={{ backgroundColor: `${value}` }}
                  />
                </div>
              )}
              <div
                key={`${rowKey}_3`}
                className="pf-v6-l-flex pf-m-column pf-m-align-self-center ws-td-text"
              >
                {isColor && '(In light theme)'} {value}
              </div>
            </div>
          </div>,
        ]
        newFilteredRows.push({
          isOpen: values ? false : undefined,
          cells,
          details: values
            ? {
                parent: rowNumber,
                fullWidth: true,
                data: mappingAsList(property, values),
              }
            : undefined,
        })
        rowNumber += 1
        if (values) {
          rowNumber += 1
        }
      }
    })
    return newFilteredRows
  }

  const INITIAL_REGEX = /.*/
  const [searchRE, setSearchRE] = useState<RegExp>(INITIAL_REGEX)
  const [rows, setRows] = useState(getFilteredRows(searchRE))

  const hasPrefixToRender = !(typeof cssPrefix === 'undefined')

  const onCollapse = (
    _event: React.MouseEvent,
    rowKey: number,
    isOpen: boolean,
  ) => {
    const collapseAll = rowKey === undefined
    let newRows = Array.from(rows)

    if (collapseAll) {
      newRows = newRows.map((r) =>
        r.isOpen === undefined ? r : { ...r, isOpen },
      )
    } else {
      newRows[rowKey] = { ...newRows[rowKey], isOpen }
    }
    setRows(newRows)
  }

  const getDebouncedFilteredRows = debounce((value) => {
    const newSearchRE = new RegExp(value, 'i')
    setSearchRE(newSearchRE)
    setRows(getFilteredRows(newSearchRE))
  }, debounceLength)

  return (
    <Stack hasGutter>
      {hasPrefixToRender && (
        <>
          {autoLinkHeader && (
            <AutoLinkHeader
              headingLevel="h3"
              className="pf-v6-u-mt-lg pf-v6-u-mb-md"
            >{`Prefixed with '${cssPrefix}'`}</AutoLinkHeader>
          )}
          <CSSSearch getDebouncedFilteredRows={getDebouncedFilteredRows} />
          <Table
            variant="compact"
            aria-label={`CSS Variables prefixed with ${cssPrefix}`}
          >
            <Thead>
              <Tr>
                {!hideSelectorColumn && (
                  <React.Fragment>
                    <Th screenReaderText="Expand or collapse column" />
                    <Th>Selector</Th>
                  </React.Fragment>
                )}
                <Th>Variable</Th>
                <Th>Value</Th>
              </Tr>
            </Thead>
            {!hideSelectorColumn ? (
              rows.map((row, rowIndex: number) => (
                <Tbody key={rowIndex} isExpanded={row.isOpen}>
                  <Tr>
                    <Td
                      expand={
                        row.details
                          ? {
                              rowIndex,
                              isExpanded: row.isOpen || false,
                              onToggle: onCollapse,
                              expandId: `css-vars-expandable-toggle-${cssPrefix}`,
                            }
                          : undefined
                      }
                    />
                    <Td dataLabel="Selector">{row.cells[0]}</Td>
                    <Td dataLabel="Variable">{row.cells[1]}</Td>
                    <Td dataLabel="Value">{row.cells[2]}</Td>
                  </Tr>
                  {row.details ? (
                    <Tr isExpanded={row.isOpen}>
                      {!row.details.fullWidth ? <Td /> : null}
                      <Td dataLabel="Selector" colSpan={5}>
                        {row.details.data}
                      </Td>
                    </Tr>
                  ) : null}
                </Tbody>
              ))
            ) : (
              <Tbody>
                {rows.map((row, rowIndex: number) => (
                  <Tr key={rowIndex}>
                    <Td dataLabel="Variable">{row.cells[0]}</Td>
                    <Td dataLabel="Value">{row.cells[1]}</Td>
                  </Tr>
                ))}
              </Tbody>
            )}
          </Table>
        </>
      )}
    </Stack>
  )
}
