import React from 'react'
import {
  Gallery,
  GalleryItem,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Label,
  Content,
} from '@patternfly/react-core'
import { SectionGalleryItem } from './SectionGallery'
import { sentenceCase } from 'change-case'
import { convertToReactComponent } from '@patternfly/ast-helpers'

interface SectionGalleryGridLayoutProps {
  /** Section where the gallery is located */
  section: string
  /** List of gallery items */
  galleryItems: SectionGalleryItem[]
  /** Indicates the grid layout has item summary text */
  hasGridText: boolean
  /** Indicates the grid layout has item images */
  hasGridImages: boolean
}

export const SectionGalleryGridLayout = ({
  section,
  galleryItems,
  hasGridText,
  hasGridImages,
}: SectionGalleryGridLayoutProps) => (
  <Gallery hasGutter>
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
        <GalleryItem span={4} key={idx}>
          <Card id={name} key={idx} isClickable>
            <CardHeader
              selectableActions={{
                to: itemLink,
                selectableActionId: `${name}-input`,
                selectableActionAriaLabelledby: name,
                name: `clickable-card-${idx}`,
              }}
            >
              <CardTitle>{sentenceCase(name)}</CardTitle>
            </CardHeader>
            {(hasGridImages || hasGridText) && (
              <CardBody>
                {hasGridImages && img && (
                  <img src={img.src} alt={`${name} illustration`} /> // verify whether this img.src approach is correct
                )}
                {hasGridText && (
                  <Content isEditorial>
                    <Content component="p">
                      {getSummaryComponent(React)}
                    </Content>
                  </Content>
                )}
              </CardBody>
            )}
            {data.label && (
              <CardFooter>
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
              </CardFooter>
            )}
          </Card>
        </GalleryItem>
      )
    })}
  </Gallery>
)
