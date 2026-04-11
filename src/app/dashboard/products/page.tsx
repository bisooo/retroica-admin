import Link from "next/link"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ProductTable } from "@/components/products/product-table"
import { Button } from "@/components/ui/button"

export default async function ProductsPage() {
  const supabase = await createClient()

  const [{ data: products, error }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, title, price, condition, description, delivery_includes, specs, created_at, category_id, inventory_status, profiles!owner_id (name), platform_listings (platform, status, price, platform_data)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, parent_id, level"),
  ])

  if (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory.</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            ADD PRODUCT
          </Button>
        </Link>
      </div>

      {products && products.length > 0 ? (
        <ProductTable products={products} categories={categories ?? []} />
      ) : (
        <div className="border-2 border-border p-8 text-center text-muted-foreground">
          No products yet.
        </div>
      )}
    </div>
  )
}
