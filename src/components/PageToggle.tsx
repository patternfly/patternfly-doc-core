import type React from 'react'
import { PageToggleButton } from '@patternfly/react-core'
import styles from '@patternfly/react-styles/css/components/Page/page'
import BarsIcon from '@patternfly/react-icons/dist/esm/icons/bars-icon'
import { useStore } from '@nanostores/react'
import { isNavOpen } from '../stores/navStore'
import { useEffect } from 'react'

export const PageToggle: React.FunctionComponent = () => {
  const $isNavOpen = useStore(isNavOpen)

  function onToggle() {
    isNavOpen.set(!$isNavOpen)
  }

  useEffect(() => {
    const pageComp = document.querySelector(`.${styles.page}`);

    if (pageComp) {
      (pageComp as HTMLElement).style.setProperty(
        `--${styles.page}__sidebar--Width`,
        $isNavOpen ? '' : '0',
      )
    }
  }, [$isNavOpen])

  return (
    <PageToggleButton
      aria-label="Global navigation"
      onSidebarToggle={onToggle}
      isSidebarOpen={$isNavOpen}
    >
      <BarsIcon />
    </PageToggleButton>
  )
}
