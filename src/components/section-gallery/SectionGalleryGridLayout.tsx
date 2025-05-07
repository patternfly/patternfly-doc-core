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
                {hasGridImages && data.illustration && (
                  <img src={img.src} alt={`${name} illustration`} /> // verify whether this img.src approach is correct
                )}
                {hasGridText && (
                  <Content isEditorial>
                    <Content component="p">{data.summary}</Content>
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
                {typeof data.label !== 'string' && <>{data.label}</>}
              </CardFooter>
            )}
          </Card>
        </GalleryItem>
      )})}
  </Gallery>
)
