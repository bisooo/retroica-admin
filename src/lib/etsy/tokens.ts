/**
 * Etsy token management.
 *
 * Tokens are stored in the etsy_tokens table (single row, service-role only).
 * Access tokens expire after ~1 hour. This module transparently refreshes
 * them when needed and persists the new tokens back to the DB.
 *
 * All functions are server-only — never import this in client components.
 */

import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Internal service-role client (bypasses RLS — tokens table is service-only)
// ---------------------------------------------------------------------------
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role env vars')
  return createClient(url, key, { auth: { persistSession: false } })
}

interface TokenRow {
  access_token: string
  refresh_token: string
  expires_at: string
}

// ---------------------------------------------------------------------------
// Read tokens from DB
// ---------------------------------------------------------------------------
async function readTokens(): Promise<TokenRow> {
  const sb = serviceClient()
  const { data, error } = await sb
    .from('etsy_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('id', 1)
    .single()

  if (error || !data) {
    throw new Error(`Failed to read etsy_tokens: ${error?.message ?? 'no row found'}`)
  }
  return data
}

// ---------------------------------------------------------------------------
// Persist new tokens to DB
// ---------------------------------------------------------------------------
async function writeTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number // seconds
): Promise<void> {
  const sb = serviceClient()
  const expires_at = new Date(Date.now() + expiresIn * 1000).toISOString()

  const { error } = await sb.from('etsy_tokens').upsert(
    { id: 1, access_token: accessToken, refresh_token: refreshToken, expires_at, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  )
  if (error) throw new Error(`Failed to write etsy_tokens: ${error.message}`)
}

// ---------------------------------------------------------------------------
// Refresh the access token using the stored refresh token
// ---------------------------------------------------------------------------
async function refreshAccessToken(refreshToken: string): Promise<TokenRow> {
  const apiKey = process.env.ETSY_API_KEY
  if (!apiKey) throw new Error('Missing ETSY_API_KEY env var')

  const res = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: apiKey,
      refresh_token: refreshToken,
    }),
  })

  const data = await res.json()
  if (!data.access_token) {
    throw new Error(`Etsy token refresh failed: ${JSON.stringify(data)}`)
  }

  const expiresIn = data.expires_in ?? 3600
  await writeTokens(data.access_token, data.refresh_token, expiresIn)

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Public: get a valid access token (refreshes automatically if expired)
// ---------------------------------------------------------------------------
export async function getValidAccessToken(): Promise<string> {
  const tokens = await readTokens()

  // Refresh 2 minutes before expiry to avoid edge cases
  const expiresAt = new Date(tokens.expires_at).getTime()
  const needsRefresh = Date.now() >= expiresAt - 2 * 60 * 1000

  if (needsRefresh) {
    const refreshed = await refreshAccessToken(tokens.refresh_token)
    return refreshed.access_token
  }

  return tokens.access_token
}

// ---------------------------------------------------------------------------
// Public: seed initial tokens into DB (call once after OAuth flow)
// ---------------------------------------------------------------------------
export async function seedTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn = 3600
): Promise<void> {
  await writeTokens(accessToken, refreshToken, expiresIn)
}
