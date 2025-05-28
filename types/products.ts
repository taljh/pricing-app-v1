// Define la estructura de datos para un producto
export type Product = {
  id: string
  name: string
  sku?: string
  description?: string
  initial_price?: number
  price?: number
  category?: string
  image_url?: string
  has_pricing: boolean
  is_available: boolean
  url?: string
  user_id: string
  created_at?: string
  updated_at?: string
}