'use server'

import { createClient } from '@/lib/supabase/server'

export async function createProduct(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const title = (formData.get('title') as string).trim()
  const slug = (formData.get('slug') as string).trim()
  const description = (formData.get('description') as string)?.trim() || null
  const category_id = (formData.get('category_id') as string) || null
  const owner_id = (formData.get('owner_id') as string) || null
  const delivery_includes =
    (formData.get('delivery_includes') as string)?.trim() || null

  const rawPrice = formData.get('price') as string
  const rawCondition = formData.get('condition') as string
  const price = rawPrice ? Number(rawPrice) : null
  const condition = rawCondition ? Number(rawCondition) : null
  const inventory_status = (formData.get('inventory_status') as string) || 'ready'

  // Collect spec fields — prefixed with "spec_", rest is the label
  const specs: Record<string, string> = {}
  for (const [key, value] of Array.from(formData.entries())) {
    if (key.startsWith('spec_') && typeof value === 'string' && value.trim()) {
      specs[key.slice(5)] = value.trim()
    }
  }

  const { error } = await supabase.from('products').insert({
    title,
    slug,
    description,
    category_id,
    condition,
    price,
    specs: Object.keys(specs).length > 0 ? specs : null,
    delivery_includes,
    owner_id,
    inventory_status,
    images: [],
  })

  if (error) return { error: error.message }
  return {}
}
