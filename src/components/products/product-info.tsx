"use client"

import { useState } from "react"
import { Star, ChevronDown, ChevronUp } from "lucide-react"
import { getStarColor } from "@/lib/utils/rating"

interface CategoryField {
  id: string
  key: string
  label: string
  field_type: string
  display_order: number
}

interface ProductInfoProps {
  product: {
    id: string
    title: string
    price?: number
    condition?: number
    specs?: Record<string, string>
    deliveryIncludes?: string
  }
  categoryFields?: CategoryField[]
}

export function ProductInfo({ product, categoryFields = [] }: ProductInfoProps) {
  const [expandedSections, setExpandedSections] = useState({
    specs: true,
    deliveryIncludes: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const conditionStarsDesktop = Math.floor(product.condition || 0)
  const conditionStarsMobile = Math.floor((product.condition || 0) / 2)
  const mobileRating = ((product.condition || 0) / 2).toFixed(1)
  const starColor = getStarColor(product.condition || 0)

  // Display specs in order of categoryFields definition.
  // Specs may be stored with snake_case keys (e.g. "iso_range") OR
  // human-readable label keys (e.g. "ISO Range") depending on import source.
  // We check both to ensure compatibility.
  const specsToDisplay = categoryFields.length > 0
    ? categoryFields
        .map((field) => ({
          ...field,
          value:
            product.specs?.[field.key] ||           // snake_case key match
            product.specs?.[field.label] ||          // exact label match
            "",
        }))
        .filter((item) => item.value)
    : Object.entries(product.specs || {}).map(([key, value]) => ({
        key,
        label: key,
        value: value || "",
        field_type: "text",
      }))

  return (
    <div className="h-full flex flex-col gap-4 pt-4 overflow-y-auto">
      {/* Product Title */}
      <div className="flex-shrink-0">
        <h1 className="font-sans text-2xl font-bold mb-1 text-foreground">
          {product.title}
        </h1>
      </div>

      {/* Price and Condition - Desktop Layout */}
      <div className="flex-shrink-0 hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
        {/* Price */}
        <div className="font-business text-xl font-bold text-foreground">
          {product.price ? `$${product.price.toFixed(2)}` : "_"}
        </div>

        {/* Condition - Desktop 10 stars */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(10)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < conditionStarsDesktop
                    ? starColor
                    : "fill-muted stroke-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="font-business text-sm text-foreground">
            ({product.condition || 0})
          </span>
        </div>
      </div>

      {/* Price and Condition - Mobile Layout */}
      <div className="flex-shrink-0 lg:hidden space-y-3">
        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="font-business text-xl font-bold text-foreground">
            {product.price ? `$${product.price.toFixed(2)}` : "_"}
          </div>

          {/* Condition - Mobile 5 stars */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < conditionStarsMobile
                      ? starColor
                      : "fill-muted stroke-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="font-business text-sm text-foreground">
              ({mobileRating})
            </span>
          </div>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="flex-1 min-h-0 space-y-4 border-t-2 border-border pt-4">
        {/* SPECS Section */}
        <div className="border-b-2 border-border pb-4">
          <button
            onClick={() => toggleSection("specs")}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-business text-sm font-bold text-foreground">
              SPECS
            </h3>
            {expandedSections.specs ? (
              <ChevronUp className="h-4 w-4 text-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground" />
            )}
          </button>
          {expandedSections.specs && (
            <div className="mt-4 space-y-2 font-business text-xs text-foreground">
              {specsToDisplay.length > 0 ? (
                specsToDisplay.map((field) => (
                  <div key={field.key} className="flex justify-between gap-4">
                    <span className="font-bold">{field.label}:</span>
                    <span className="text-right text-muted-foreground">
                      {field.value || "_"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">NO SPECS AVAILABLE</p>
              )}
            </div>
          )}
        </div>

        {/* Delivery Includes Section */}
        {product.deliveryIncludes && (
          <div className="pb-4">
            <button
              onClick={() => toggleSection("deliveryIncludes")}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-business text-sm font-bold text-foreground">
                DELIVERY INCLUDES
              </h3>
              {expandedSections.deliveryIncludes ? (
                <ChevronUp className="h-4 w-4 text-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-foreground" />
              )}
            </button>
            {expandedSections.deliveryIncludes && (
              <div className="mt-4 space-y-1 font-business text-xs text-foreground">
                {product.deliveryIncludes.split(",").map((item, index) => (
                  <p key={index}>• {item.trim()}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
