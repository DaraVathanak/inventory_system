import {
  BarChart3, Boxes, FileText, LogOut, Moon, ShoppingCart,
  ShieldCheck, Sun, Truck, UserCog, Warehouse,
} from "lucide-react";
import { User } from "../types";
import { cn } from "../lib/utils";

interface Props {
  currentUser: User;
  currentPage: string;
  onChangePage: (page: string) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const allMenuItems = [
  { key: "dashboard",  label: "Dashboard",    icon: BarChart3,    roles: ["admin", "manager", "employee"] },
  { key: "users",      label: "Users & Roles", icon: UserCog,      roles: ["admin"] },
  { key: "orders",     label: "Orders",        icon: ShoppingCart, roles: ["admin", "manager", "employee"] },
  { key: "products",   label: "Products",      icon: Boxes,        roles: ["admin", "manager", "employee"] },
  { key: "suppliers",  label: "Suppliers",     icon: Truck,        roles: ["admin", "manager"] },
  { key: "warehouses", label: "Warehouses",    icon: Warehouse,    roles: ["admin", "manager", "employee"] },
  { key: "reports",    label: "Reports",       icon: FileText,     roles: ["admin", "manager"] },
];

export default function Sidebar({ currentUser, currentPage, onChangePage, onLogout, isDark, onToggleTheme }: Props) {
  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <aside className="flex w-[270px] flex-col border-r border-black/5 bg-white/70 p-4 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/60">
      {/* Brand */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-700 p-5 text-white dark:from-white dark:to-zinc-300 dark:text-zinc-950">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-3 dark:bg-zinc-900/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Inventory</h1>
              <p className="text-sm opacity-70">Control panel</p>
            </div>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleTheme}
            className="rounded-2xl bg-white/10 p-2.5 transition hover:scale-105 dark:bg-zinc-900/20"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark
              ? <Sun  className="h-4 w-4" />
              : <Moon className="h-4 w-4" />
            }
          </button>
        </div>

        <div className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm dark:bg-zinc-900/20">
          <p className="opacity-70 text-xs mb-0.5">Signed in as</p>
          <p className="font-semibold">{currentUser.username}</p>
          <p className="text-xs opacity-60 capitalize mt-0.5">{currentUser.role}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChangePage(item.key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all",
                active
                  ? "bg-zinc-950 text-white shadow-lg dark:bg-white dark:text-zinc-950"
                  : "text-zinc-600 hover:bg-black/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.05]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="mt-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-zinc-500 transition-all hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Sign out
      </button>
    </aside>
  );
}