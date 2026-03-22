import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/products/product-form'
import { Button } from '@/components/ui/button'

export default async function NewProductPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: categoryFields }, { data: profiles }] =
    await Promise.all([
      supabase
        .from('categories')
        .select('id, name, parent_id, level')
        .order('level', { ascending: true })
        .order('name', { ascending: true }),
      supabase
        .from('category_fields')
        .select('id, category_id, key, label, field_type, options, display_order')
        .order('display_order', { ascending: true }),
      supabase
        .from('profiles')
        .select('id, name, commission, notes, created_at')
        .order('name', { ascending: true }),
    ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/products">
          <Button variant="ghost" className="gap-2 px-0 hover:bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-sans text-sm">BACK TO PRODUCTS</span>
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">New Product</h1>
        <p className="text-muted-foreground">Register a new product in the inventory.</p>
      </div>

      <ProductForm
        categories={categories ?? []}
        categoryFields={categoryFields ?? []}
        profiles={profiles ?? []}
      />
    </div>
  )
}
