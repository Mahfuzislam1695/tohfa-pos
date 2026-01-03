"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ShoppingBag,
  ChevronDown,
  Layers,
  User,
  Wallet,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Sales", href: "/sales", icon: ShoppingBag },
  { name: "Products", href: "/products", icon: Package },
  { name: "Purchases", href: "/purchases", icon: FileText },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Product Removals", href: "/product-removal", icon: AlertTriangle },
  // { name: "Returns", href: "/returns", icon:  },
  { name: "Users", href: "/users", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

const setupMenu = [
  { name: "Categories", href: "/setup/categories" },
  { name: "Brands", href: "/setup/brands" },
  // { name: "Suppliers", href: "/setup/suppliers" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [setupExpanded, setSetupExpanded] = useState(pathname.startsWith("/setup"))

  return (
    <aside
      className={cn(
        "relative border-r border-border/50 bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center border-b border-border/50 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">TOHFA POS System</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
      </Button>

      <nav className="space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center",
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}

        <div>
          <button
            onClick={() => setSetupExpanded(!setupExpanded)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/setup")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center",
            )}
            title={collapsed ? "Setup" : undefined}
          >
            <Layers className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Setup</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", setupExpanded && "rotate-180")} />
              </>
            )}
          </button>
          {!collapsed && setupExpanded && (
            <div className="mt-1 space-y-1 pl-11">
              {setupMenu.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/profile"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            collapsed && "justify-center",
          )}
          title={collapsed ? "Profile" : undefined}
        >
          <User className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Profile</span>}
        </Link>

        {/* Settings at the bottom */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            collapsed && "justify-center",
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </nav>
    </aside>
  )
}
