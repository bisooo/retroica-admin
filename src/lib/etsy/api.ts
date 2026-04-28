/**
 * Etsy API helper — server-only.
 * Uses getValidAccessToken() so tokens are always fresh.
 */

import { getValidAccessToken } from './tokens'

function apiKey() {
  const key = process.env.ETSY_API_KEY
  const secret = process.env.ETSY_API_SECRET
  if (!key || !secret) throw new Error('Missing ETSY_API_KEY or ETSY_API_SECRET')
  return `${key}:${secret}`
}

async function etsyGet(path: string): Promise<Response> {
  const token = await getValidAccessToken()
  return fetch(`https://api.etsy.com/v3/application${path}`, {
    headers: {
      'x-api-key': apiKey(),
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  })
}

interface EtsyListing {
  listing_id: number
  title: string
  state: string
  url: string
  quantity: number
  views: number
  creation_timestamp: number
  price: { amount: number; divisor: number } | null
  MainImage?: { url_570xN: string } | null
}

interface EtsyListingsPage {
  count: number
  results: EtsyListing[]
}

export async function fetchActiveListings(shopId: string): Promise<EtsyListing[]> {
  const all: EtsyListing[] = []
  const limit = 100
  let offset = 0

  while (true) {
    const res = await etsyGet(
      `/shops/${shopId}/listings/active?limit=${limit}&offset=${offset}&includes[]=MainImage`
    )
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Etsy API ${res.status}: ${body}`)
    }
    const data: EtsyListingsPage = await res.json()
    const results = data.results ?? []
    all.push(...results)
    if (results.length < limit) break
    offset += limit
  }

  return all
}
