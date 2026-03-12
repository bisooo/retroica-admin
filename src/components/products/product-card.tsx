"use client"

import { Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getStarColor } from "@/lib/utils/rating"

interface ProductCardProps {
  id: string
  slug: string
  title: string
  price?: number
  image?: string
  condition?: number
}

export function ProductCard({
  slug,
  title,
  price,
  image,
  condition = 0,
}: ProductCardProps) {
  const conditionStars = Math.floor(condition)
  const starColor = getStarColor(condition)
  const productUrl = `/dashboard/products/${slug}`

  return (
    <div className="border-2 border-border bg-background group hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative aspect-square border-b-2 border-border">
        <Link href={productUrl} className="block w-full h-full">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="font-business text-muted-foreground text-xs">NO IMAGE</span>
            </div>
          )}
        </Link>
      </div>

      <div className="p-4 flex flex-col">
        {/* Product Name */}
        <Link href={productUrl} className="block">
          <h3 className="font-sans text-sm font-bold mb-3 hover:underline text-foreground text-center line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>
        </Link>

        {/* Divider */}
        <div className="border-t border-border mb-3" />

        {/* Price */}
        <p className="font-business text-sm text-foreground text-center mb-3">
          {price ? `$${price.toFixed(2)}` : "_"}
        </p>

        {/* Divider */}
        <div className="border-t border-border mb-3" />

        {/* Condition Stars */}
        <div className="flex items-center justify-center gap-0.5">
          {/* Mobile: 5 stars */}
          <div className="flex sm:hidden">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-2 w-2 ${
                  i < Math.floor(conditionStars / 2)
                    ? starColor
                    : "fill-none stroke-muted-foreground"
                }`}
              />
            ))}
          </div>
          {/* Desktop: 10 stars */}
          <div className="hidden sm:flex">
            {[...Array(10)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < conditionStars
                    ? starColor
                    : "fill-none stroke-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
