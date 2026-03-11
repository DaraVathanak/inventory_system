import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Truck,
  FileText,
} from "lucide-react"
import type { Page } from "@/App"

const navItems: Array<{
  key: Page
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Package },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "warehouses", label: "Warehouses", icon: Warehouse },
  { key: "suppliers", label: "Suppliers", icon: Truck },
  { key: "reports", label: "Reports", icon: FileText },
]

export default function Sidebar({
  page,
  setPage,
}: {
  page: Page
  setPage: (page: Page) => void
}) {
  return (
    <aside className="w-72 border-r border-white/10 bg-slate-950/80 p-5">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 font-semibold text-white">
          IM
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
            Admin Suite
          </p>
          <h1 className="text-xl font-semibold text-white">Inventory Nexus</h1>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Environment
        </p>
        <p className="mt-2 text-sm font-medium text-slate-100">
          Production Operations
        </p>
        <p className="mt-1 text-sm text-slate-400">
          ERP + warehouse + order control synced
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = page === item.key

          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                active
                  ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white ring-1 ring-cyan-400/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  active
                    ? "text-cyan-300"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}