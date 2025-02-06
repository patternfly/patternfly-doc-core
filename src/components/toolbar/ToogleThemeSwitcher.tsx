import React from 'react'
import { Icon, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core'
import MoonIcon from '@patternfly/react-icons/dist/esm/icons/moon-icon'
import SunIcon from '@patternfly/react-icons/dist/esm/icons/sun-icon'

export const ToggleThemeSwitcher: React.FunctionComponent = () => {
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);

  React.useEffect(() => {
    const darkTheme = window?.localStorage?.getItem('darkMode') === 'true' ? true : false;
    const html = document.querySelector('html') as HTMLHtmlElement
    html.classList.toggle('pf-v6-theme-dark', darkTheme)
    setIsDarkTheme(darkTheme);
  });

  const toggleDarkTheme = (_evt: unknown, selected: boolean) => {
    const darkThemeToggleClicked = !selected === isDarkTheme
    const html = document.querySelector('html') as HTMLHtmlElement
    html.classList.toggle('pf-v6-theme-dark', darkThemeToggleClicked)
    setIsDarkTheme(darkThemeToggleClicked); 
    localStorage.setItem('darkMode', JSON.stringify(darkThemeToggleClicked));
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
