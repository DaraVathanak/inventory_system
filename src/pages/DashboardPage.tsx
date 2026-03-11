import { motion } from "framer-motion"
import { Package, ShoppingCart, Warehouse, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

import { products } from "../data/products"
import { orders } from "../data/orders"
import { warehouses } from "../data/warehouses"
import { suppliers } from "../data/suppliers"

import { isExpiringSoon } from "../lib/format"

const stats = [
  { title: "Products", value: products.length, icon: Package },
  { title: "Orders", value: orders.length, icon: ShoppingCart },
  { title: "Warehouses", value: warehouses.length, icon: Warehouse },
  { title: "Suppliers", value: suppliers.length, icon: Truck },
]

export default function DashboardPage() {
  const alerts = products.filter(
    (p) => p.stock_quantity <= p.reorder_point || isExpiringSoon(p.expire_date)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-400">
          Overview of inventory, orders, warehouses, and suppliers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <motion.div key={item.title} whileHover={{ y: -4 }}>
              <Card className="border-white/10 bg-white/5 text-white">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{item.title}</p>
                      <p className="mt-3 text-3xl font-semibold">{item.value}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <Icon className="h-5 w-5 text-cyan-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="border-white/10 bg-white/5 text-white xl:col-span-7">
          <CardHeader>
            <CardTitle>Low Stock & Expiry Alerts</CardTitle>
            <CardDescription className="text-slate-400">
              Items that need attention.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((item) => (
              <div
                key={item.sku_id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-4"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-slate-400">
                    {item.sku_id} • {item.category_name} • {item.supplier_name}
                  </p>
                </div>
                <div className="flex gap-2">
                  {item.stock_quantity <= item.reorder_point && (
                    <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-300">
                      Reorder
                    </Badge>
                  )}
                  {isExpiringSoon(item.expire_date) && (
                    <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-300">
                      Expiring Soon
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white xl:col-span-5">
          <CardHeader>
            <CardTitle>Warehouse Utilization</CardTitle>
            <CardDescription className="text-slate-400">
              Capacity snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {warehouses.map((w) => (
              <div key={w.warehouse_id} className="rounded-2xl border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{w.location_name}</p>
                    <p className="text-sm text-slate-400">{w.address}</p>
                  </div>
                  <span className="text-sm text-cyan-400">{w.utilization}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                    style={{ width: `${w.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}