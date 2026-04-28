'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { syncEtsyListings, type SyncResult } from '@/app/actions/sync-etsy'
import { useRouter } from 'next/navigation'

export function SyncButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)

  async function handleSync() {
    setPending(true)
    setResult(null)
    const res = await syncEtsyListings()
    setResult(res)
    setPending(false)
    if (!res.error) router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      {result && !result.error && (
        <p className="text-xs text-muted-foreground">
          {result.active} active · {result.sold} sold · {result.pricesFilled} prices synced
        </p>
      )}
      {result?.error && (
        <p className="text-xs text-destructive">{result.error}</p>
      )}
      <Button
        variant="outline"
        className="gap-2"
        onClick={handleSync}
        disabled={pending}
      >
        <RefreshCw className={`h-4 w-4 ${pending ? 'animate-spin' : ''}`} />
        {pending ? 'SYNCING...' : 'SYNC ETSY'}
      </Button>
    </div>
  )
}
