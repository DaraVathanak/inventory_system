import { useState } from "react"
import AppShell from "./components/layout/AppShell"

import DashboardPage from "./pages/DashboardPage"
import ProductsPage from "./pages/ProductsPage"
import OrdersPage from "./pages/OrdersPage"
import WarehousesPage from "./pages/WarehousesPage"
import SuppliersPage from "./pages/SuppliersPage"
import ReportsPage from "./pages/ReportsPage"

export type Page =
  | "dashboard"
  | "products"
  | "orders"
  | "warehouses"
  | "suppliers"
  | "reports"

export default function App() {
  const [page, setPage] = useState<Page>("dashboard")

  const renderPage = () => {
    switch (page) {
      case "products":
        return <ProductsPage />
      case "orders":
        return <OrdersPage />
      case "warehouses":
        return <WarehousesPage />
      case "suppliers":
        return <SuppliersPage />
      case "reports":
        return <ReportsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <AppShell page={page} setPage={setPage}>
      {renderPage()}
    </AppShell>
  )
}