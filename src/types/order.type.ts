import { Product } from './product.type'

export interface Order {
  id: number
  attributes: OrderBody
}

export interface OrderBody {
  userName?: string
  phone?: string
  address?: string
  additionalInfo?: string
  payment?: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  total?: number
  subTotal?: number
  isPayment?: boolean
  users_permissions_user?: {
    data?: {
      id?: number
      attributes?: {
        username?: string
        email?: string
        provider?: string
        confirmed?: boolean
        blocked?: boolean
        createdAt?: string
        updatedAt?: string
        phone?: string
        address?: string
      }
    }
  }
  products?: ProductOrder[]
}

interface ProductOrder {
  id?: number
  productName?: string
  quantity?: number
  priceOnProduct?: number
  sumPrice?: number
  bb_product?: Product
}
