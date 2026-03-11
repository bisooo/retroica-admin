"use client"

import { Grid3X3, List, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductGridControlsProps {
  productCount: number
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export function ProductGridControls({
  productCount,
  viewMode,
  onViewModeChange,
}: ProductGridControlsProps) {
  return (
    <div className="mb-6 border-b-2 border-border pb-4">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Top Row - View controls and product count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex border-2 border-border">
            <Button
              variant="ghost"
              size="sm"
              className={`border-r-2 border-border rounded-none px-2 ${
                viewMode === "grid"
                  ? "bg-foreground text-background"
                  : "text-foreground"
              }`}
              onClick={() => onViewModeChange("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none px-2 ${
                viewMode === "list"
                  ? "bg-foreground text-background"
                  : "text-foreground"
              }`}
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <span className="font-sans text-sm text-foreground">
            {productCount} PRODUCTS
          </span>
        </div>

        {/* Bottom Row - Sort */}
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            className="font-sans text-sm border-2 border-border text-foreground hover:bg-accent bg-transparent"
          >
            SORT BY PRICE
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between">
        {/* Left side - View controls and product count */}
        <div className="flex items-center gap-4">
          <div className="flex border-2 border-border">
            <Button
              variant="ghost"
              size="sm"
              className={`border-r-2 border-border rounded-none ${
                viewMode === "grid"
                  ? "bg-foreground text-background"
                  : "text-foreground"
              }`}
              onClick={() => onViewModeChange("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none ${
                viewMode === "list"
                  ? "bg-foreground text-background"
                  : "text-foreground"
              }`}
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <span className="font-sans text-sm text-foreground">
            {productCount} PRODUCTS
          </span>
        </div>

        {/* Right side - Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm text-foreground">SORT BY</span>
          <Button
            variant="outline"
            className="font-sans text-sm border-2 border-border text-foreground hover:bg-accent bg-transparent"
          >
            PRICE
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
