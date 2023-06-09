import { Brand } from './brand.type'
import { Category } from './category.type'

export interface Product {
  id: number
  attributes: {
    name: string
    price: string
    discountPrice: string
    shortDescription: null
    description: string
    inventory: number
    rating: number
    createdAt: string
    updatedAt: string
    publishedAt: string
    face_diameter: number
    glass_material: string
    wire_material: string
    mechanism: string
    water_resistance: string
    trademark: string
    productImage: {
      data: ProductImage[]
    }
    bb_brand: {
      data: Brand
    }
    bb_product_category: {
      data: Category
    }
  }
}

export interface ProductImage {
  id: number
  attributes: {
    name: string
    alternativeText: null
    caption: null
    width: number
    height: number
    hash: string
    ext: string
    mime: string
    size: number
    url: string
    previewUrl: null
    provider: string
    provider_metadata: {
      public_id: string
      resource_type: string
    }
    createdAt: string
    updatedAt: string
  }
}

export interface ProductListConfig {
  sort?: string | []
  filters?: object
  populate?: string | object
  fields?: []
  pagination?: object
  publicationState?: string
  locale?: string | []
}
