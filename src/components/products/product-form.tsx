'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createProduct } from '@/app/actions/products'
import type { CategoryField, Profile } from '@/types/product'

interface Category {
  id: string
  name: string
  parent_id: string | null
  level: number
}

interface ProductFormProps {
  categories: Category[]
  categoryFields: CategoryField[]
  profiles: Profile[]
}

const selectCn =
  'flex h-9 w-full border-2 border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50'

const textareaCn =
  'flex w-full border-2 border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-y'

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function ProductForm({ categories, categoryFields, profiles }: ProductFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  const [l1Id, setL1Id] = useState('')
  const [l2Id, setL2Id] = useState('')
  const [l3Id, setL3Id] = useState('')

  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const l1List = useMemo(() => categories.filter(c => c.level === 1), [categories])
  const l2List = useMemo(
    () => (l1Id ? categories.filter(c => c.level === 2 && c.parent_id === l1Id) : []),
    [categories, l1Id]
  )
  const l3List = useMemo(
    () => (l2Id ? categories.filter(c => c.level === 3 && c.parent_id === l2Id) : []),
    [categories, l2Id]
  )
  const activeFields = useMemo(
    () =>
      l2Id
        ? categoryFields
            .filter(f => f.category_id === l2Id)
            .sort((a, b) => a.display_order - b.display_order)
        : [],
    [categoryFields, l2Id]
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createProduct(formData)

    if (result.error) {
      setError(result.error)
      setPending(false)
    } else {
      router.push('/dashboard/products')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {error && (
        <div className="border-2 border-destructive px-4 py-3 text-sm text-destructive font-sans">
          {error}
        </div>
      )}

      {/* ── Basic Info ── */}
      <section className="border-2 border-border p-6 flex flex-col gap-4">
        <h2 className="text-xs font-bold tracking-widest text-muted-foreground">
          BASIC INFO
        </h2>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">TITLE *</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={e => {
              setTitle(e.target.value)
              if (!slugEdited) setSlug(toSlug(e.target.value))
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">SLUG *</Label>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={e => {
              setSlug(e.target.value)
              setSlugEdited(true)
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">PRICE (€)</Label>
            <Input id="price" name="price" type="number" step="0.01" min="0" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="condition">CONDITION (0–10)</Label>
            <Input
              id="condition"
              name="condition"
              type="number"
              step="0.1"
              min="0"
              max="10"
            />
          </div>
        </div>

        {profiles.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="owner_id">OWNER</Label>
            <select id="owner_id" name="owner_id" className={selectCn}>
              <option value="">— No owner —</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name ?? p.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* ── Category ── */}
      <section className="border-2 border-border p-6 flex flex-col gap-4">
        <h2 className="text-xs font-bold tracking-widest text-muted-foreground">
          CATEGORY
        </h2>

        <div className="flex flex-col gap-1.5">
          <Label>CATEGORY</Label>
          <select
            className={selectCn}
            value={l1Id}
            onChange={e => {
              setL1Id(e.target.value)
              setL2Id('')
              setL3Id('')
            }}
          >
            <option value="">— Select category —</option>
            {l1List.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {l2List.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>SUBCATEGORY</Label>
            <select
              className={selectCn}
              value={l2Id}
              onChange={e => {
                setL2Id(e.target.value)
                setL3Id('')
              }}
            >
              <option value="">— Select subcategory —</option>
              {l2List.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {l3List.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>TYPE</Label>
            <select
              name="category_id"
              className={selectCn}
              value={l3Id}
              onChange={e => setL3Id(e.target.value)}
            >
              <option value="">— Select type —</option>
              {l3List.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* ── Specs (dynamic, resets on L2 change) ── */}
      {activeFields.length > 0 && (
        <section key={l2Id} className="border-2 border-border p-6 flex flex-col gap-4">
          <h2 className="text-xs font-bold tracking-widest text-muted-foreground">
            SPECS
          </h2>

          {activeFields.map(field => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <Label htmlFor={`spec_${field.key}`}>{field.label.toUpperCase()}</Label>
              {field.field_type === 'textarea' ? (
                <textarea
                  id={`spec_${field.key}`}
                  name={`spec_${field.label}`}
                  className={textareaCn}
                  rows={3}
                />
              ) : (
                <Input id={`spec_${field.key}`} name={`spec_${field.label}`} />
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Additional Info ── */}
      <section className="border-2 border-border p-6 flex flex-col gap-4">
        <h2 className="text-xs font-bold tracking-widest text-muted-foreground">
          ADDITIONAL INFO
        </h2>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">DESCRIPTION</Label>
          <textarea
            id="description"
            name="description"
            className={textareaCn}
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="delivery_includes">DELIVERY INCLUDES</Label>
          <Input
            id="delivery_includes"
            name="delivery_includes"
            placeholder="e.g. Battery, Charger, Strap"
          />
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'SAVING...' : 'SAVE PRODUCT'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={pending}
        >
          CANCEL
        </Button>
      </div>
    </form>
  )
}
