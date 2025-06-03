import React from 'react'
import {
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  Split,
  SplitItem,
  Label,
  Content,
  ContentVariants,
} from '@patternfly/react-core'
import { SectionGalleryItem } from './SectionGallery'
import { sentenceCase } from 'change-case'
import { convertToReactComponent } from '../../ast'

interface SectionGalleryListLayoutProps {
  /** Section where the gallery is located */
  section: string
  /** List of gallery items */
  galleryItems: SectionGalleryItem[]
  /** Indicates the list layout has item summary text */
  hasListText: boolean
  /** Indicates the list layout has item images */
  hasListImages: boolean
}

export const SectionGalleryListLayout = ({
  section,
  galleryItems,
  hasListText,
  hasListImages,
}: SectionGalleryListLayoutProps) => (
  <DataList onSelectDataListItem={() => {}} aria-label="gallery-list">
    {galleryItems.map(({ name, img, data }, idx) => {
      const itemLink = data.link || `/${section}/${name}`

      //TODO: rethink how JSX / enriched content is passed to framework
      const summaryNoLinks = data.summary.replace(
        /<a[^>]*>([^<]+)<\/a>/gm,
        '$1',
      )
      const { code } = convertToReactComponent(`<>${summaryNoLinks}</>`)
      const getSummaryComponent = new Function('React', code)

      return (
        <a href={itemLink} key={idx} className="ws-section-gallery-item">
          <DataListItem>
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  hasListImages && img && (
                    <DataListCell width={1} key="illustration">
                      <div>
                        <img
                          src={img.src} // same as GridLayout, check whether this is the best method
                          alt={`${name} illustration`}
                        />
                      </div>
                    </DataListCell>
                  ),
                  <DataListCell width={5} key="text-description">
                    <Split
                      className={hasListText ? 'pf-v6-u-mb-md' : undefined}
                    >
                      <SplitItem isFilled>
                        <Content isEditorial>
                          <Content component={ContentVariants.h2}>
                            <span>{sentenceCase(name)}</span>
                          </Content>
                        </Content>
                      </SplitItem>
                      <SplitItem>
                        {data.label === 'beta' && (
                          <Label color="blue" isCompact>
                            Beta
                          </Label>
                        )}
                        {data.label === 'deprecated' && (
                          <Label color="grey" isCompact>
                            Deprecated
                          </Label>
                        )}
                        {data.label === 'demo' && (
                          <Label color="purple" isCompact>
                            Demo
                          </Label>
                        )}
                      </SplitItem>
                    </Split>
                    {hasListText && (
                      <Content isEditorial>
                        <Content component="p">
                          {getSummaryComponent(React)}
                        </Content>
                      </Content>
                    )}
                  </DataListCell>,
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        </a>
      )
    })}
  </DataList>
)
