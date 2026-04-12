'use client'

import { useState } from 'react'

interface InventoryProduct {
  title: string
  price: number
  owner: string
}

interface ActiveInventoryProps {
  products: InventoryProduct[]
  owners: string[]
}

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)
}

export function ActiveInventory({ products, owners }: ActiveInventoryProps) {
  const [selectedOwner, setSelectedOwner] = useState('all')

  const filtered = selectedOwner === 'all'
    ? products
    : products.filter(p => p.owner === selectedOwner)

  const total = filtered.reduce((s, p) => s + p.price, 0)

  return (
    <div className="border-2 border-border">
      {/* Header */}
      <div className="p-4 border-b-2 border-border flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest text-muted-foreground">ACTIVE INVENTORY VALUE</p>
          <p className="text-2xl font-bold mt-1">{fmt(total)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} active listings</p>
        </div>
        <select
          value={selectedOwner}
          onChange={e => setSelectedOwner(e.target.value)}
          className="flex h-9 border-2 border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All Owners</option>
          {owners.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Per-owner breakdown (only when showing all) */}
      {selectedOwner === 'all' && (
        <div className="p-4 border-b-2 border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="pb-2 text-left text-xs font-bold tracking-widest text-muted-foreground">OWNER</th>
                <th className="pb-2 text-right text-xs font-bold tracking-widest text-muted-foreground">LISTINGS</th>
                <th className="pb-2 text-right text-xs font-bold tracking-widest text-muted-foreground">VALUE</th>
                <th className="pb-2 text-right text-xs font-bold tracking-widest text-muted-foreground">SHARE</th>
              </tr>
            </thead>
            <tbody>
              {owners.map(owner => {
                const ownerProducts = products.filter(p => p.owner === owner)
                const ownerTotal = ownerProducts.reduce((s, p) => s + p.price, 0)
                return (
                  <tr key={owner} className="border-b border-border">
                    <td className="py-2">{owner}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">{ownerProducts.length}</td>
                    <td className="py-2 text-right tabular-nums">{fmt(ownerTotal)}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">
                      {total > 0 ? ((ownerTotal / total) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product list */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-border bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-bold tracking-widest text-muted-foreground">PRODUCT</th>
              <th className="px-3 py-2 text-left text-xs font-bold tracking-widest text-muted-foreground">OWNER</th>
              <th className="px-3 py-2 text-right text-xs font-bold tracking-widest text-muted-foreground">PRICE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 max-w-sm">
                  <span className="line-clamp-1">{p.title}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{p.owner}</td>
                <td className="px-3 py-2 whitespace-nowrap tabular-nums text-right">{fmt(p.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
