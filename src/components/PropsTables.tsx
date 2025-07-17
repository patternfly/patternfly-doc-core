import { FunctionComponent, useEffect, useState } from 'react'
import { PropsTable } from './PropsTable'
import { Stack, StackItem } from '@patternfly/react-core'
import { AutoLinkHeader } from './AutoLinkHeader'

interface PropsTablesProps {
  propComponents: string[]
  url: string
}

async function getPropsData(propComponents: string[], urlBase: string) {
  if (!propComponents || propComponents.length === 0) {
    return []
  }

  const url = new URL(`/props?components=${propComponents}`, urlBase)

  try {
    const response = await fetch(url.toString())
    const propsData = await response.json()
    return propsData
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return []
  }
}

export const PropsTables: FunctionComponent<PropsTablesProps> = ({
  propComponents,
  url,
}) => {
  const [propsData, setPropsData] = useState([])
  useEffect(() => {
    getPropsData(propComponents, url).then(setPropsData)
  }, [propComponents, url])

  return (
    <Stack hasGutter>
      <StackItem>
        <AutoLinkHeader
          headingLevel="h2"
          className="pf-v6-c-content--h2"
          id="props-table"
        >
          Props
        </AutoLinkHeader>
      </StackItem>
      {propsData
        .filter((comp: any) => !!comp)
        .map((component: any) => (
          <StackItem key={component.name}>
            <PropsTable
              componentName={component.name}
              componentDescription={component.description}
              componentProps={component.props}
            />
          </StackItem>
        ))}
    </Stack>
  )
}
