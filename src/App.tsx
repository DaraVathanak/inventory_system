import { useEffect, useMemo, useState } from "react";
import { applyTheme, getInitialTheme } from "./lib/theme";
import { authApi, clearToken, setToken } from "./lib/api";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import SuppliersPage from "./pages/SuppliersPage";
import WarehousesPage from "./pages/WarehousesPage";
import ReportsPage from "./pages/ReportsPage";
import { User } from "./types";

const USER_KEY = "inventory_user";

function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function removeUser() {
  localStorage.removeItem(USER_KEY);
}

export default function App() {
  const [isDark, setIsDark]           = useState(() => getInitialTheme());
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadUser());
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => { applyTheme(isDark); }, [isDark]);

  function handleLogin(user: User, token: string) {
    setToken(token);
    saveUser(user);
    setCurrentUser(user);
    setCurrentPage("dashboard");
  }

  function handleLogout() {
    authApi.logout().catch(() => {});
    clearToken();
    removeUser();
    setCurrentUser(null);
    setCurrentPage("dashboard");
  }

  function handleChangePage(page: string) {
    const adminOnly       = ["users"];
    const managerAndAbove = ["suppliers", "reports"];
    if (adminOnly.includes(page)       && currentUser?.role !== "admin")    return;
    if (managerAndAbove.includes(page) && currentUser?.role === "employee") return;
    setCurrentPage(page);
  }

  const pageContent = useMemo(() => {
    if (!currentUser) return null;

    if (currentPage === "users" && currentUser.role !== "admin")
      return <DashboardPage user={currentUser} />;
    if (["suppliers", "reports"].includes(currentPage) && currentUser.role === "employee")
      return <DashboardPage user={currentUser} />;

    switch (currentPage) {
      case "dashboard":  return <DashboardPage user={currentUser} />;
      case "users":      return <UsersPage />;
      case "orders":     return <OrdersPage />;
      case "products":   return <ProductsPage />;
      case "suppliers":  return <SuppliersPage />;
      case "warehouses": return <WarehousesPage />;
      case "reports":    return <ReportsPage />;
      default:           return <DashboardPage user={currentUser} />;
    }
  }, [currentPage, currentUser]);

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        isDark={isDark}
        onToggleTheme={() => setIsDark((p) => !p)}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.1),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.08),_transparent_40%),linear-gradient(to_bottom_right,#f8fafc,#eef2ff)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.1),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.08),_transparent_40%),linear-gradient(to_bottom_right,#09090b,#18181b)]">
      <Sidebar
        currentUser={currentUser}
        currentPage={currentPage}
        onChangePage={handleChangePage}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={() => setIsDark((p) => !p)}
      />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {pageContent}
      </main>
    </div>
  );
}