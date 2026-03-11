import { ProductGrid } from "@/components/products/product-grid"

// Placeholder product data - will be replaced with real data fetching
const SAMPLE_PRODUCTS = [
  {
    id: "1e4584be-a852-4e0a-8777-eda6fe712afb",
    slug: "philips-aq6485",
    title: "Philips AQ6485",
    price: 49.99,
    condition: 8.8,
    images: [],
  },
  {
    id: "2f7d3dcd-c737-4013-9536-408dba293112",
    slug: "sony-ej361",
    title: "Sony EJ361",
    price: 79.99,
    condition: 9.6,
    images: [],
  },
  {
    id: "0011bdca-3e8e-4af1-9f68-01dcc002a110",
    slug: "olympus-stylus-epic-zoom",
    title: "Olympus Stylus Epic Zoom",
    price: 299.99,
    condition: 9.7,
    images: [],
  },
  {
    id: "009110f0-4eb1-427a-8298-b455a2e0b5c2",
    slug: "samsung-pl20",
    title: "Samsung PL20",
    price: 89.99,
    condition: 9.8,
    images: [],
  },
  {
    id: "5cfb01de-0a95-41e3-b462-8db7344aa402",
    slug: "canon-310-xl",
    title: "Canon 310 XL",
    price: 449.99,
    condition: 9.8,
    images: [],
  },
  {
    id: "0cbb2090-07e1-45c9-b888-a73490ee6a3d",
    slug: "panasonic-hc-v130",
    title: "Panasonic HC-V130",
    price: 159.99,
    condition: 8.8,
    images: [],
  },
]

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-muted-foreground">
          Manage your product inventory.
        </p>
      </div>

      <ProductGrid products={SAMPLE_PRODUCTS} />
    </div>
  )
}
