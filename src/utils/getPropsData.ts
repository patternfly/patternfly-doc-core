export async function getPropsData(propComponents: string[], baseUrl: URL) {
  if (!propComponents.length) {
    return []
  }

  const url = new URL(`/props?components=${propComponents}`, baseUrl)
  const response = await fetch(url)
  const propsData = await response.json()

  return propsData
}