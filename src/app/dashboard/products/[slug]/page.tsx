import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductInfo } from "@/components/products/product-info"
import { Button } from "@/components/ui/button"

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  // Fetch product with its category hierarchy
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      categories!category_id (
        id,
        name,
        parent_id,
        level
      )
    `)
    .eq("slug", slug)
    .single()

  if (error || !product) {
    notFound()
  }

  // Get the Level 2 category ID (parent of the product's Level 3 category)
  const level2CategoryId = product.categories?.parent_id

  // Fetch category_fields for the Level 2 category
  let categoryFields: any[] = []
  if (level2CategoryId) {
    const { data: fields } = await supabase
      .from("category_fields")
      .select("*")
      .eq("category_id", level2CategoryId)
      .order("display_order", { ascending: true })
    
    categoryFields = fields || []
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/products">
          <Button variant="ghost" className="gap-2 px-0 hover:bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-sans text-sm">BACK TO PRODUCTS</span>
          </Button>
        </Link>
      </div>

      {/* Product Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Image Section */}
        <div className="w-full lg:w-1/2">
          <div className="aspect-square border-2 border-border bg-muted relative">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground text-sm">NO IMAGE</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full lg:w-1/2">
          <ProductInfo 
            product={{
              ...product,
              deliveryIncludes: product.delivery_includes,
            }}
            categoryFields={categoryFields}
          />
        </div>
      </div>
    </div>
  )
}
