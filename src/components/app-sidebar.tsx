"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r-2 border-border bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b-2 border-border px-4">
        {!collapsed && (
          <Link href="/dashboard" className="text-lg font-bold uppercase tracking-tight">
            Retroica
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("h-8 w-8", collapsed && "mx-auto")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <nav className="flex-1 p-2">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const NavLink = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  isActive && "bg-accent",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <li key={item.href}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                    <TooltipContent side="right">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </li>
              )
            }

            return <li key={item.href}>{NavLink}</li>
          })}
        </ul>
      </nav>
    </aside>
  )
}
