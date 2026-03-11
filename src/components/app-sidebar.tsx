"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Moon,
  Sun,
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
    title: "Financials",
    href: "/dashboard/financials",
    icon: DollarSign,
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
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

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

      <div className="border-t-2 border-border p-2">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="mx-auto flex h-10 w-10"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="flex w-full items-center justify-start gap-3 px-3 py-2"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-5 w-5" />
                <span className="text-sm font-medium">LIGHT MODE</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                <span className="text-sm font-medium">DARK MODE</span>
              </>
            )}
          </Button>
        )}
      </div>
    </aside>
  )
}
