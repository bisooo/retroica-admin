import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ProductInfo } from "@/components/products/product-info"
import { Button } from "@/components/ui/button"

// Placeholder product data - will be replaced with real data fetching
const PLACEHOLDER_PRODUCT = {
  id: "1",
  title: "Product Name",
  price: 199.99,
  condition: 9.2,
  specs: {
    lens: "50mm f/1.8",
    iso_range: "100-6400",
    shutter_speed: "1/4000s",
    features: "Auto-focus, Weather sealed",
  },
  deliveryIncludes: "Camera body, Strap, Battery, Charger",
  images: [] as string[],
}

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  
  // TODO: Fetch real product data by slug
  const product = { ...PLACEHOLDER_PRODUCT, title: slug.replace(/-/g, " ").toUpperCase() }

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
          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  )
}
