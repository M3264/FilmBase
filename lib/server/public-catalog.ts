import {
  publicOffer,
  publicTitle,
  type CatalogPage,
  type CatalogTitle,
  type PublicCatalogTitle,
  type PublicSourceOffer,
  type SourceOffer,
  type UnifiedHomeData,
} from "@/lib/domain/catalog"

export function serializeTitle(title: CatalogTitle): PublicCatalogTitle {
  return publicTitle(title)
}

export function serializeOffers(offers: SourceOffer[]): PublicSourceOffer[] {
  return offers.map(publicOffer)
}

export function serializeCatalogPage(page: CatalogPage) {
  return { ...page, items: page.items.map(publicTitle) }
}

export function serializeHome(home: UnifiedHomeData) {
  return {
    sections: home.sections.map((section) => ({ ...section, items: section.items.map(publicTitle) })),
    featured: home.featured.map(publicTitle),
  }
}
