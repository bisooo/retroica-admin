'use server'

import { createClient } from '@supabase/supabase-js'
import { fetchActiveListings } from '@/lib/etsy/api'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export interface SyncResult {
  active: number
  sold: number
  pricesFilled: number
  error?: string
}

export async function syncEtsyListings(): Promise<SyncResult> {
  const shopId = process.env.ETSY_SHOP_ID
  if (!shopId) return { active: 0, sold: 0, pricesFilled: 0, error: 'Missing ETSY_SHOP_ID' }

  const supabase = serviceClient()

  // 1. Load all etsy platform_listings from DB
  const { data: dbListings, error: dbErr } = await supabase
    .from('platform_listings')
    .select('id, product_id, platform_id, price')
    .eq('platform', 'etsy')

  if (dbErr) return { active: 0, sold: 0, pricesFilled: 0, error: dbErr.message }

  // 2. Fetch active listings from Etsy
  let etsyListings
  try {
    etsyListings = await fetchActiveListings(shopId)
  } catch (e) {
    return { active: 0, sold: 0, pricesFilled: 0, error: String(e) }
  }

  const etsyMap = new Map(etsyListings.map(l => [String(l.listing_id), l]))
  const now = new Date().toISOString()

  // 3. Split DB rows into active (found on Etsy) vs sold (not found)
  const soldIds: string[] = []
  const activeUpdates: Promise<void>[] = []
  let active = 0
  let pricesFilled = 0

  for (const dbRow of dbListings) {
    const etsy = etsyMap.get(dbRow.platform_id)

    if (!etsy) {
      soldIds.push(dbRow.id)
      continue
    }

    const price = etsy.price ? etsy.price.amount / etsy.price.divisor : null
    const listed_at = etsy.creation_timestamp
      ? new Date(etsy.creation_timestamp * 1000).toISOString()
      : null

    const update = supabase
      .from('platform_listings')
      .update({
        price,
        status: 'active',
        listed_at,
        synced_at: now,
        platform_data: {
          title: etsy.title,
          state: etsy.state,
          url: etsy.url,
          quantity: etsy.quantity,
          views: etsy.views,
          image: etsy.MainImage?.url_570xN ?? null,
        },
      })
      .eq('id', dbRow.id)
      .then(({ error }) => { if (!error) active++ }) as Promise<void>

    activeUpdates.push(update)

    // Always sync price from Etsy if available
    if (price != null) {
      activeUpdates.push(
        supabase
          .from('products')
          .update({ price })
          .eq('id', dbRow.product_id)
          .then(({ error }) => { if (!error) pricesFilled++ }) as Promise<void>
      )
    }
  }

  // Run all active updates in parallel
  await Promise.all(activeUpdates)

  // 4. Mark missing listings as sold in batches
  let sold = 0
  for (let i = 0; i < soldIds.length; i += 100) {
    const batch = soldIds.slice(i, i + 100)
    const { error } = await supabase
      .from('platform_listings')
      .update({ status: 'sold', synced_at: now })
      .in('id', batch)
    if (!error) sold += batch.length
  }

  return { active, sold, pricesFilled }
}
