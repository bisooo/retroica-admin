"use client"

import { useState } from "react"
import { ProductCard } from "./product-card"
import { ProductGridControls } from "./product-grid-controls"

interface Product {
  id: string
  slug: string
  title: string
  price?: number
  condition?: number
  images?: string[]
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="w-full">
      <ProductGridControls
        productCount={products.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {products.length === 0 ? (
        <div className="text-center py-12 border-2 border-border">
          <p className="font-sans text-sm text-muted-foreground">
            NO PRODUCTS FOUND.
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-4 lg:gap-6 w-full ${
            viewMode === "grid"
              ? "grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 lg:grid-cols-2"
          }`}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              title={product.title}
              price={product.price}
              condition={product.condition}
              image={product.images?.[0]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
