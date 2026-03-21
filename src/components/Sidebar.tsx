import {
  BarChart3, Boxes, FileText, LogOut, Moon, PackagePlus, ShoppingCart,
  ShieldCheck, Sun, Truck, UserCog, Warehouse, ChevronLeft, ChevronRight,
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
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const allMenuItems = [
  { key: "dashboard",  label: "Dashboard",    icon: BarChart3,    roles: ["admin", "manager", "employee"] },
  { key: "users",      label: "Users & Roles", icon: UserCog,      roles: ["admin"] },
  { key: "orders",     label: "Orders",        icon: ShoppingCart, roles: ["admin", "manager", "employee"] },
  { key: "products",   label: "Products",      icon: Boxes,        roles: ["admin", "manager", "employee"] },
  { key: "suppliers",  label: "Suppliers",     icon: Truck,        roles: ["admin", "manager"] },
  { key: "warehouses", label: "Warehouses",    icon: Warehouse,    roles: ["admin", "manager", "employee"] },
  { key: "restock",    label: "Restock",       icon: PackagePlus,  roles: ["admin", "manager"] },
  { key: "reports",    label: "Reports",       icon: FileText,     roles: ["admin", "manager"] },
];

export default function Sidebar({
  currentUser, currentPage, onChangePage, onLogout,
  isDark, onToggleTheme, collapsed, onToggleCollapse,
}: Props) {
  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-black/5 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/60 transition-all duration-300 shrink-0",
        collapsed ? "w-[72px]" : "w-[270px]"
      )}
    >
      {/* Collapse toggle button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900 hover:scale-110 transition-transform"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
          : <ChevronLeft  className="h-3.5 w-3.5 text-zinc-500" />
        }
      </button>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-3">
        {/* Brand */}
        <div className={cn(
          "rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-700 text-white dark:from-white dark:to-zinc-300 dark:text-zinc-950 transition-all duration-300",
          collapsed ? "p-3" : "p-4"
        )}>
          <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between mb-3")}>
            <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
              <div className="shrink-0 rounded-xl bg-white/15 p-2 dark:bg-zinc-900/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-base font-semibold leading-tight">Inventory</h1>
                  <p className="text-xs opacity-70">Control panel</p>
                </div>
              )}
            </div>

            {/* Theme toggle — only show when expanded */}
            {!collapsed && (
              <button
                onClick={onToggleTheme}
                className="rounded-xl bg-white/10 p-2 transition hover:scale-105 dark:bg-zinc-900/20"
                title={isDark ? "Light mode" : "Dark mode"}
              >
                {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>

          {!collapsed && (
            <div className="rounded-xl bg-white/10 px-3 py-2 text-xs dark:bg-zinc-900/20">
              <p className="opacity-60 mb-0.5">Signed in as</p>
              <p className="font-semibold truncate">{currentUser.username}</p>
              <p className="opacity-50 capitalize">{currentUser.role}</p>
            </div>
          )}

          {/* When collapsed show theme toggle under icon */}
          {collapsed && (
            <button
              onClick={onToggleTheme}
              className="mt-2 w-full flex justify-center rounded-xl bg-white/10 p-2 transition hover:scale-105 dark:bg-zinc-900/20"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          )}
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
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex w-full items-center rounded-2xl text-left text-sm font-medium transition-all",
                  collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
                  active
                    ? "bg-zinc-950 text-white shadow-lg dark:bg-white dark:text-zinc-950"
                    : "text-zinc-600 hover:bg-black/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.05]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={onLogout}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex w-full items-center rounded-2xl text-sm font-medium text-zinc-500 transition-all hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/30 dark:hover:text-red-400",
            collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );
}