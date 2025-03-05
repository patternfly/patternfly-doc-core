import type React from 'react'
import styles from '@patternfly/react-styles/css/components/Page/page'
import { PageToggleButton } from '@patternfly/react-core'
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
    /** Applies sidebar styles to the island element astro creates as a wrapper for the sidebar.
     * Without it the page content will not expand to fill the space left by the sidebar when it is collapsed.
     */
    // Possibly can refactor to remove applying classes when https://github.com/patternfly/patternfly/issues/7377 goes in
    function applySidebarStylesToIsland() {
      const isClientSide = typeof window !== 'undefined'
      const sideBarIsland =
        document.getElementById('page-sidebar-body')?.parentElement

      if (!isClientSide || !sideBarIsland) {
        return
      }

      if (!sideBarIsland.classList.contains(styles.pageSidebar)) {
        sideBarIsland.classList.add(
          styles.pageSidebar,
          $isNavOpen ? styles.modifiers.expanded : styles.modifiers.collapsed,
        )
      } else {
        sideBarIsland.classList.toggle(styles.modifiers.expanded)
        sideBarIsland.classList.toggle(styles.modifiers.collapsed)
      }
      sideBarIsland.setAttribute('aria-hidden', `${!$isNavOpen}`)
    }

    applySidebarStylesToIsland()
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
