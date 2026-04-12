import { createClient } from '@/lib/supabase/server'
import { RevenueChart } from '@/components/financials/revenue-chart'
import { ActiveInventory } from '@/components/financials/active-inventory'

// Ledger types that are actual Etsy fees (exclude DISBURSE2 which is a bank payout,
// REFUND_GROSS which is a refund event, and PAYMENT_GROSS which is incoming revenue)
const FEE_TYPES = new Set([
  'transaction',
  'PAYMENT_PROCESSING_FEE',
  'shipping_transaction',
  'vat_on_processing_fees',
  'vat_seller_services',
  'listing',
  'prolist',
  'renew_expired',
  'auto_renew_expired',
  'renew_sold',
  'renew_sold_auto',
  'offsite_ads_fee',
  'tier_2_subscription',
  'sales_tax',
])

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)
}

function monthLabel(iso: string) {
  const [year, month] = iso.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleString('en-GB', { month: 'short', year: '2-digit' })
}

export default async function FinancialsPage() {
  const supabase = await createClient()

  // Fetch admin profile id for fallback owner assignment
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('name', 'admin')
    .single()

  // Active listings: products with platform_listings.status = 'active', join owner profile
  const { data: activeProducts } = await supabase
    .from('platform_listings')
    .select('price, products!inner(title, owner_id, profiles!owner_id(name))')
    .eq('platform', 'etsy')
    .eq('status', 'active')

  const adminName = adminProfile?.name ?? 'admin'

  const inventoryProducts = (activeProducts ?? []).map(l => {
    const product = l.products as unknown as { title: string; owner_id: string | null; profiles: { name: string | null } | { name: string | null }[] | null }
    const profiles = product.profiles
    const ownerName = Array.isArray(profiles) ? profiles[0]?.name : profiles?.name
    return {
      title: product.title,
      price: Number(l.price ?? 0),
      owner: ownerName ?? adminName,
    }
  }).sort((a, b) => b.price - a.price)

  const inventoryOwners = Array.from(new Set(inventoryProducts.map(p => p.owner))).sort()

  const [{ data: receipts }, { data: ledger }] = await Promise.all([
    supabase
      .from('etsy_receipts')
      .select('receipt_id, subtotal, grandtotal, total_shipping, total_tax, discount, created_at, country_iso, product_title, listing_id, is_paid, status')
      .order('created_at', { ascending: false }),
    supabase
      .from('etsy_ledger_entries')
      .select('ledger_type, amount, created_at'),
  ])

  if (!receipts || !ledger) {
    return (
      <div className="border-2 border-border p-8 text-center text-muted-foreground">
        No financial data yet.
      </div>
    )
  }

  const paidReceipts = receipts.filter(r => r.is_paid)

  // --- Summary stats ---
  const totalGross = paidReceipts.reduce((s, r) => s + Number(r.subtotal), 0)
  const totalOrders = paidReceipts.length
  const avgOrder = totalOrders > 0 ? totalGross / totalOrders : 0

  const totalFees = ledger
    .filter(e => FEE_TYPES.has(e.ledger_type) && Number(e.amount) < 0)
    .reduce((s, e) => s + Math.abs(Number(e.amount)), 0)

  const netRevenue = totalGross - totalFees

  // --- Monthly chart data (all months with activity) ---
  const monthlyGross: Record<string, number> = {}
  for (const r of paidReceipts) {
    const m = r.created_at.slice(0, 7)
    monthlyGross[m] = (monthlyGross[m] || 0) + Number(r.subtotal)
  }
  const monthlyFees: Record<string, number> = {}
  for (const e of ledger) {
    if (FEE_TYPES.has(e.ledger_type) && Number(e.amount) < 0) {
      const m = e.created_at.slice(0, 7)
      monthlyFees[m] = (monthlyFees[m] || 0) + Math.abs(Number(e.amount))
    }
  }

  const chartData = Object.keys(monthlyGross)
    .sort()
    .map(m => ({
      month: monthLabel(m),
      gross: Number(monthlyGross[m].toFixed(2)),
      net: Number((monthlyGross[m] - (monthlyFees[m] || 0)).toFixed(2)),
    }))

  // --- Fee breakdown ---
  const feeBreakdown: Record<string, number> = {}
  for (const e of ledger) {
    if (FEE_TYPES.has(e.ledger_type) && Number(e.amount) < 0) {
      feeBreakdown[e.ledger_type] = (feeBreakdown[e.ledger_type] || 0) + Math.abs(Number(e.amount))
    }
  }
  const feeRows = Object.entries(feeBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([type, amount]) => ({ type, amount, pct: totalFees > 0 ? (amount / totalFees) * 100 : 0 }))

  // --- Top buyer countries ---
  const countries: Record<string, number> = {}
  for (const r of paidReceipts) {
    if (r.country_iso) countries[r.country_iso] = (countries[r.country_iso] || 0) + 1
  }
  const topCountries = Object.entries(countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Financials</h1>
        <p className="text-muted-foreground">Etsy sales data — {totalOrders} paid orders since March 2023.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'GROSS REVENUE', value: fmt(totalGross) },
          { label: 'NET REVENUE', value: fmt(netRevenue) },
          { label: 'TOTAL FEES', value: fmt(totalFees) },
          { label: 'AVG ORDER VALUE', value: fmt(avgOrder) },
        ].map(card => (
          <div key={card.label} className="border-2 border-border p-4 flex flex-col gap-1">
            <p className="text-xs font-bold tracking-widest text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="border-2 border-border p-4">
        <p className="text-xs font-bold tracking-widest text-muted-foreground mb-4">MONTHLY REVENUE</p>
        <RevenueChart data={chartData} />
      </div>

      {/* Fee breakdown + Countries side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Fee breakdown */}
        <div className="border-2 border-border p-4">
          <p className="text-xs font-bold tracking-widest text-muted-foreground mb-4">FEE BREAKDOWN</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="pb-2 text-left text-xs font-bold tracking-widest text-muted-foreground">TYPE</th>
                <th className="pb-2 text-right text-xs font-bold tracking-widest text-muted-foreground">AMOUNT</th>
                <th className="pb-2 text-right text-xs font-bold tracking-widest text-muted-foreground">%</th>
              </tr>
            </thead>
            <tbody>
              {feeRows.map(row => (
                <tr key={row.type} className="border-b border-border">
                  <td className="py-2 text-muted-foreground">{row.type}</td>
                  <td className="py-2 text-right tabular-nums">{fmt(row.amount)}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">{row.pct.toFixed(1)}%</td>
                </tr>
              ))}
              <tr>
                <td className="pt-3 font-bold">TOTAL</td>
                <td className="pt-3 text-right font-bold tabular-nums">{fmt(totalFees)}</td>
                <td className="pt-3 text-right text-muted-foreground">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Top countries */}
        <div className="border-2 border-border p-4">
          <p className="text-xs font-bold tracking-widest text-muted-foreground mb-4">TOP BUYER COUNTRIES</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="pb-2 text-left text-xs font-bold tracking-widest text-muted-foreground">COUNTRY</th>
                <th className="pb-2 text-right text-xs font-bold tracking-widest text-muted-foreground">ORDERS</th>
                <th className="pb-2 text-right text-xs font-bold tracking-widest text-muted-foreground">SHARE</th>
              </tr>
            </thead>
            <tbody>
              {topCountries.map(([country, count]) => (
                <tr key={country} className="border-b border-border">
                  <td className="py-2">{country}</td>
                  <td className="py-2 text-right tabular-nums">{count}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">
                    {((count / totalOrders) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active inventory */}
      <ActiveInventory products={inventoryProducts} owners={inventoryOwners} />

      {/* Sales table */}
      <div className="border-2 border-border">
        <div className="p-4 border-b-2 border-border">
          <p className="text-xs font-bold tracking-widest text-muted-foreground">SALES HISTORY</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-border bg-muted/50">
                {['DATE', 'PRODUCT', 'SUBTOTAL', 'SHIPPING', 'TAX', 'TOTAL', 'COUNTRY', 'STATUS'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold tracking-widest text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {receipts.map(r => (
                <tr key={r.receipt_id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <span className="line-clamp-1">{r.product_title ?? '—'}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap tabular-nums">{fmt(Number(r.subtotal))}</td>
                  <td className="px-3 py-2 whitespace-nowrap tabular-nums text-muted-foreground">{fmt(Number(r.total_shipping))}</td>
                  <td className="px-3 py-2 whitespace-nowrap tabular-nums text-muted-foreground">{fmt(Number(r.total_tax))}</td>
                  <td className="px-3 py-2 whitespace-nowrap tabular-nums font-medium">{fmt(Number(r.grandtotal))}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{r.country_iso ?? '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`text-xs font-bold ${r.is_paid ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {r.status ?? '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
