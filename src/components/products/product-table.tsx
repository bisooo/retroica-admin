'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Category {
  id: string
  name: string
  parent_id: string | null
  level: number
}

interface Product {
  id: string
  slug: string
  title: string
  price: number | null
  condition: number | null
  description: string | null
  delivery_includes: string | null
  specs: Record<string, string> | null
  created_at: string
  category_id: string | null
  profiles: { name: string | null } | { name: string | null }[] | null
}

interface ProductTableProps {
  products: Product[]
  categories: Category[]
}

type SortKey =
  | "title"
  | "slug"
  | "price"
  | "condition"
  | "owner"
  | "category"
  | "description"
  | "delivery_includes"
  | "specs"
  | "created_at"

type SortDir = "asc" | "desc"

function buildCategoryPath(
  categoryId: string | null,
  categoryMap: Map<string, Category>
): string {
  if (!categoryId) return ""
  const parts: string[] = []
  let current = categoryMap.get(categoryId)
  while (current) {
    parts.unshift(current.name)
    current = current.parent_id ? categoryMap.get(current.parent_id) : undefined
  }
  return parts.join(" → ")
}

function getOwnerName(profiles: Product["profiles"]): string {
  if (!profiles) return ""
  return (Array.isArray(profiles) ? profiles[0]?.name : profiles.name) ?? ""
}

function formatSpecs(specs: Record<string, string> | null): string {
  if (!specs || Object.keys(specs).length === 0) return ""
  return Object.entries(specs)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ")
}

function getSortValue(product: Product, key: SortKey, categoryMap: Map<string, Category>): string | number {
  switch (key) {
    case "title": return product.title?.toLowerCase() ?? ""
    case "slug": return product.slug?.toLowerCase() ?? ""
    case "price": return product.price ?? -Infinity
    case "condition": return product.condition ?? -Infinity
    case "owner": return getOwnerName(product.profiles).toLowerCase()
    case "category": return buildCategoryPath(product.category_id, categoryMap).toLowerCase()
    case "description": return product.description?.toLowerCase() ?? ""
    case "delivery_includes": return product.delivery_includes?.toLowerCase() ?? ""
    case "specs": return formatSpecs(product.specs).toLowerCase()
    case "created_at": return product.created_at ?? ""
  }
}

const thCn =
  "px-3 py-2 text-left text-xs font-bold tracking-widest text-muted-foreground whitespace-nowrap select-none"

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="inline ml-1 h-3 w-3 opacity-40" />
  return sortDir === "asc"
    ? <ChevronUp className="inline ml-1 h-3 w-3" />
    : <ChevronDown className="inline ml-1 h-3 w-3" />
}

export function ProductTable({ products, categories }: ProductTableProps) {
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("created_at")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories])

  // Unique category options derived from actual products, sorted alphabetically
  const categoryOptions = useMemo(() => {
    const seen = new Map<string, string>() // id → path
    for (const p of products) {
      if (p.category_id && !seen.has(p.category_id)) {
        seen.set(p.category_id, buildCategoryPath(p.category_id, categoryMap))
      }
    }
    return Array.from(seen.entries())
      .map(([id, path]) => ({ id, path }))
      .sort((a, b) => a.path.localeCompare(b.path))
  }, [products, categoryMap])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = products.filter(p => {
      if (q && !p.title?.toLowerCase().includes(q)) return false
      if (categoryFilter && p.category_id !== categoryFilter) return false
      return true
    })

    return [...filtered].sort((a, b) => {
      const av = getSortValue(a, sortKey, categoryMap)
      const bv = getSortValue(b, sortKey, categoryMap)
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [products, query, categoryFilter, sortKey, sortDir, categoryMap])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  function Th({ col, label }: { col: SortKey; label: string }) {
    return (
      <th
        className={`${thCn} cursor-pointer hover:text-foreground transition-colors`}
        onClick={() => handleSort(col)}
      >
        {label}
        <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </th>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by title..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="flex h-9 border-2 border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-w-48"
        >
          <option value="">All Categories</option>
          {categoryOptions.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.path}
            </option>
          ))}
        </select>
      </div>

      <div className="border-2 border-border overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-border bg-muted/50">
              <Th col="title" label="TITLE" />
              <Th col="slug" label="SLUG" />
              <Th col="price" label="PRICE" />
              <Th col="condition" label="CONDITION" />
              <Th col="owner" label="OWNER" />
              <Th col="category" label="CATEGORY" />
              <Th col="description" label="DESCRIPTION" />
              <Th col="delivery_includes" label="DELIVERY INCLUDES" />
              <Th col="specs" label="SPECS" />
              <Th col="created_at" label="CREATED" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">
                  No products found.
                </td>
              </tr>
            ) : (
              rows.map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2 align-top">
                    <Link
                      href={`/dashboard/products/${p.slug}`}
                      className="font-medium hover:underline whitespace-nowrap"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2 align-top text-muted-foreground whitespace-nowrap">{p.slug}</td>
                  <td className="px-3 py-2 align-top whitespace-nowrap">
                    {p.price != null ? `€${p.price.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-3 py-2 align-top whitespace-nowrap">
                    {p.condition != null ? p.condition : "—"}
                  </td>
                  <td className="px-3 py-2 align-top whitespace-nowrap">
                    {getOwnerName(p.profiles) || "—"}
                  </td>
                  <td className="px-3 py-2 align-top whitespace-nowrap">
                    {buildCategoryPath(p.category_id, categoryMap) || "—"}
                  </td>
                  <td className="px-3 py-2 align-top max-w-xs">
                    <span className="line-clamp-2">{p.description ?? "—"}</span>
                  </td>
                  <td className="px-3 py-2 align-top whitespace-nowrap">
                    {p.delivery_includes ?? "—"}
                  </td>
                  <td className="px-3 py-2 align-top max-w-xs">
                    <span className="line-clamp-2">{formatSpecs(p.specs) || "—"}</span>
                  </td>
                  <td className="px-3 py-2 align-top whitespace-nowrap text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
