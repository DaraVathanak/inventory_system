import { AlertTriangle, Boxes, ShoppingCart, Truck, Warehouse } from "lucide-react";
import { productsApi, ordersApi, suppliersApi, warehousesApi } from "../lib/api";
import { useApi } from "../lib/useApi";
import { StatCard, Spinner, ErrorMessage } from "../components/ui";
import { User } from "../types";

interface Props {
  user: User;
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ user, onNavigate }: Props) {
  const products   = useApi(() => productsApi.list());
  const orders     = useApi(() => ordersApi.list());
  const suppliers  = useApi(suppliersApi.list);
  const warehouses = useApi(warehousesApi.list);

  const loading = products.loading || orders.loading || suppliers.loading || warehouses.loading;
  const error   = products.error   || orders.error   || suppliers.error   || warehouses.error;

  const expiringProducts = (products.data ?? [])
    .filter((p) => p.expiry_date && p.days_left != null && p.days_left >= 0 && p.days_left <= 30)
    .sort((a, b) => (a.days_left ?? 99) - (b.days_left ?? 99));

  const stats = [
    { label: "Products",   value: products.data?.length   ?? 0, icon: Boxes,       colorClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",   page: "products"   },
    { label: "Orders",     value: orders.data?.length     ?? 0, icon: ShoppingCart, colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", page: "orders"     },
    { label: "Suppliers",  value: suppliers.data?.length  ?? 0, icon: Truck,        colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",       page: "suppliers"  },
    { label: "Warehouses", value: warehouses.data?.length ?? 0, icon: Warehouse,    colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",          page: "warehouses" },
  ];

  const modules = [
    { title: "Orders",    desc: "Track processing, shipment, and delivery.",            page: "orders"     },
    { title: "Products",  desc: "Monitor stock level, reorder point, and expiry date.", page: "products"   },
    { title: "Suppliers", desc: "Control sourcing and vendor activity.",                page: "suppliers"  },
    { title: "Reports",   desc: "Review weekly and monthly performance.",               page: "reports"    },
  ];

  if (loading) return <Spinner />;
  if (error)   return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1.5 text-zinc-500 dark:text-zinc-400">
          Welcome back, <span className="font-medium text-zinc-700 dark:text-zinc-200">{user.username}</span>. Here's your inventory at a glance.
        </p>
      </div>

      {/* Stat cards — clickable */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => onNavigate(s.page)}
            className="text-left transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <StatCard label={s.label} value={s.value} icon={s.icon} colorClass={s.colorClass} />
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* System overview — module cards clickable */}
        <div className="rounded-3xl border border-black/5 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/60 xl:col-span-2">
          <h2 className="text-lg font-semibold">System overview</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Click a module to navigate directly.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {modules.map((item) => (
              <button
                key={item.title}
                onClick={() => onNavigate(item.page)}
                className="rounded-2xl border border-black/5 bg-white/60 p-4 text-left transition hover:border-zinc-300 hover:shadow-sm dark:border-white/10 dark:bg-zinc-900/40 dark:hover:border-white/20"
              >
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Expiry alerts */}
        <div className="rounded-3xl border border-black/5 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <h2 className="text-lg font-semibold">Expiry alerts</h2>
          </div>
          <div className="mt-4 space-y-3">
            {expiringProducts.length === 0 ? (
              <p className="rounded-2xl border border-black/5 p-4 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                No products expiring within 30 days.
              </p>
            ) : (
              expiringProducts.map((p) => (
                <button
                  key={p.sku_id}
                  onClick={() => onNavigate("products")}
                  className="w-full rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-left transition hover:border-orange-500/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">
                        Expires {String(p.expiry_date).split("T")[0]}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-300">
                      {p.days_left}d left
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Last login info */}
      {user.last_login && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Last login: {new Date(user.last_login).toLocaleString()}
        </p>
      )}
    </div>
  );
}