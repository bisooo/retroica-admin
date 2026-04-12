export interface CategoryField {
  id?: string
  category_id?: string
  key: string
  label: string
  field_type: string
  options?: unknown
  display_order: number
}

export interface Profile {
  id: string
  name: string | null
  commission: number | null
  notes: string | null
  created_at: string
}

export type Platform = 'etsy' | 'aukro' | 'retroica'
export type ListingStatus = 'draft' | 'active' | 'sold' | 'paused' | 'needs_sync'

export interface PlatformListing {
  id: string
  product_id: string
  platform: Platform
  platform_id: string | null
  status: ListingStatus
  price: number | null
  platform_data: Record<string, unknown>
  listed_at: string | null
  synced_at: string | null
  created_at: string
}
