import React from 'react'
import { Icon, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core'
import MoonIcon from '@patternfly/react-icons/dist/esm/icons/moon-icon'
import SunIcon from '@patternfly/react-icons/dist/esm/icons/sun-icon'
import { getThemePreference, updateThemePreference } from '../../utils/theme'

export const ToggleThemeSwitcher: React.FunctionComponent = () => {
  const [isDarkTheme, setIsDarkTheme] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
    const darkTheme = getThemePreference() === 'dark'
    setIsDarkTheme(darkTheme)
  }, [])

  const toggleDarkTheme = (_evt: unknown, selected: boolean) => {
    const darkThemeToggleClicked = !selected === isDarkTheme
    updateThemePreference(darkThemeToggleClicked ? 'dark' : 'light')
    setIsDarkTheme(darkThemeToggleClicked)
  }

  if (!isMounted) {
    return null
  }

  return (
    <ToggleGroup aria-label="Dark theme toggle group">
      <ToggleGroupItem
        aria-label="light theme toggle"
        icon={
          <Icon size="md">
            <SunIcon />
          </Icon>
        }
        isSelected={!isDarkTheme}
        onChange={toggleDarkTheme}
      />
      <ToggleGroupItem
        aria-label="dark theme toggle"
        icon={
          <Icon size="md">
            <MoonIcon />
          </Icon>
        }
        isSelected={isDarkTheme}
        onChange={toggleDarkTheme}
      />
    </ToggleGroup>
  )
}
