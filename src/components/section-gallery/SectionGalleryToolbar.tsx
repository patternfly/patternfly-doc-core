import { CSSProperties, Dispatch, SetStateAction } from 'react'
import {
  Button,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Content,
  ContentVariants,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core'
import ListIcon from '@patternfly/react-icons/dist/esm/icons/list-icon'
import ThIcon from '@patternfly/react-icons/dist/esm/icons/th-icon'

interface SectionGalleryToolbarProps {
  /** Total count of gallery items */
  galleryItemCount: number
  /** Current search term */
  searchTerm: string
  /** Setter for search term */
  setSearchTerm: Dispatch<SetStateAction<string>>
  /** Current layout */
  layoutView: 'grid' | 'list'
  /** Setter for layout */
  setLayoutView: Dispatch<SetStateAction<'grid' | 'list'>>
  /** Placeholder text for the gallery search input */
  placeholderText?: string
  /** Text for the amount of gallery items */
  countText?: string
}

export const SectionGalleryToolbar = ({
  galleryItemCount,
  searchTerm,
  setSearchTerm,
  layoutView,
  setLayoutView,
  placeholderText = 'Search by name',
  countText = ' items',
}: SectionGalleryToolbarProps) => (
  <Toolbar isSticky>
    <ToolbarContent>
      <ToolbarItem>
        <SearchInput
          value={searchTerm}
          placeholder={placeholderText}
          onChange={(_evt, val) => {
            setSearchTerm(val)
          }}
        />
      </ToolbarItem>
      {searchTerm && (
        <ToolbarItem>
          <Button variant="link" onClick={() => setSearchTerm('')}>
            Reset
          </Button>
        </ToolbarItem>
      )}
      <ToolbarItem>
        <ToggleGroup>
          <ToggleGroupItem
            icon={<ThIcon />}
            aria-label="grid icon button"
            isSelected={layoutView === 'grid'}
            onChange={() => setLayoutView('grid')}
          ></ToggleGroupItem>
          <ToggleGroupItem
            icon={<ListIcon />}
            aria-label="list icon button"
            isSelected={layoutView === 'list'}
            onChange={() => setLayoutView('list')}
          ></ToggleGroupItem>
        </ToggleGroup>
      </ToolbarItem>
      <ToolbarItem
        variant="pagination"
        gap={{ default: 'gapMd', md: 'gapNone' }}
        style={
          {
            '--pf-v6-c-toolbar__item--MinWidth': 'max-content',
          } as CSSProperties
        }
        className="pf-m-align-self-center"
      >
        <Content isEditorial component={ContentVariants.small}>
          {galleryItemCount}
          {countText}
        </Content>
      </ToolbarItem>
    </ToolbarContent>
  </Toolbar>
)
