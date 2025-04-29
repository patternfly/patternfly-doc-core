import { useState } from 'react'

import { SectionGalleryToolbar } from './SectionGalleryToolbar'
import { SectionGalleryGridLayout } from './SectionGalleryGridLayout'
import { SectionGalleryListLayout } from './SectionGalleryListLayout'
import { snakeCase } from 'change-case'

import './SectionGallery.css'

export interface SectionGalleryItem {
  /** Name of the gallery item. Should match the page name of the item for routing, or an item should provide a link property in the SectionGalleryItemData. */
  name: string
  /** Image file import */
  img: any
  /** Data of the gallery item */
  data: SectionGalleryItemData
}

export interface SectionGalleryItemData {
  /** Path to the item illustration */ // TODO: remove if img method is fine
  illustration: string
  /** Summary text of the item */
  summary: JSX.Element
  /** Label included in the item footer. Choose from a preset or pass a custom label. */
  label?: 'beta' | 'demo' | 'deprecated' | JSX.Element
  /** Link to the item, relative to the section, e.g. "/{section}/{page}" */
  link?: string
}

interface SectionGalleryProps {
  /** Collection of illustations for the gallery */
  illustrations: any
  /** Section where the gallery is located */
  section: string
  /** Data of all gallery items */
  galleryItemsData: Record<string, SectionGalleryItemData>
  /** Placeholder text for the gallery search input */
  placeholderText: string
  /** Text for the amount of gallery items */
  countText: string
  /** Starting layout for the gallery */
  initialLayout: 'grid' | 'list'
  /** Indicates the grid layout has item summary text */
  hasGridText: boolean
  /** Indicates the grid layout has item images */
  hasGridImages: boolean
  /** Indicates the list layout has item summary text */
  hasListText: boolean
  /** Indicates the list layout has item images */
  hasListImages: boolean
}

export const SectionGallery = ({
  illustrations,
  section,
  galleryItemsData,
  placeholderText,
  countText,
  initialLayout = 'grid',
  hasGridText = false,
  hasGridImages = true,
  hasListText = true,
  hasListImages = true,
}: SectionGalleryProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [layoutView, setLayoutView] = useState(initialLayout)

  const galleryItems: SectionGalleryItem[] = Object.entries(galleryItemsData)
    .map(([galleryItem, galleryItemData]) => ({
      name: galleryItem,
      img: illustrations[snakeCase(galleryItem)],
      data: galleryItemData,
    }))
    .sort((item1, item2) => item1.name.localeCompare(item2.name))

  const nonCharsRegex = /[^A-Z0-9]+/gi
  const filteringTerm = searchTerm.replace(nonCharsRegex, '')
  const filteredItems: SectionGalleryItem[] = galleryItems.filter((item) =>
    new RegExp(filteringTerm).test(item.name.replace(nonCharsRegex, '')),
  )

  return (
    <div className='ws-section-gallery'>
      <SectionGalleryToolbar
        galleryItemCount={galleryItems.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        layoutView={layoutView}
        setLayoutView={setLayoutView}
        placeholderText={placeholderText}
        countText={countText}
      />
      {layoutView === 'grid' && (
        <SectionGalleryGridLayout
          section={section}
          galleryItems={filteredItems}
          hasGridText={hasGridText}
          hasGridImages={hasGridImages}
        />
      )}
      {layoutView === 'list' && (
        <SectionGalleryListLayout
          section={section}
          galleryItems={filteredItems}
          hasListText={hasListText}
          hasListImages={hasListImages}
        />
      )}
    </div>
  )
}
