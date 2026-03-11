import { createClient } from "@/lib/supabase/server"
import { ProductGrid } from "@/components/products/product-grid"

export default async function ProductsPage() {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, title, price, condition, images")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-muted-foreground">
          Manage your product inventory.
        </p>
      </div>

      {products && products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="border-2 border-border p-8 text-center text-muted-foreground">
          No products yet.
        </div>
      )}
    </div>
  )
}
