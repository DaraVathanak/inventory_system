import type { Product } from "@/types/product"

export const products: Product[] = [
  {
    sku_id: "SKU-1001",
    name: "Industrial Drill",
    unit_price: 149,
    stock_quantity: 42,
    reorder_point: 20,
    expire_date: "2027-12-31",
    category_name: "Tools",
    supplier_name: "Acme Supply Co.",
    manager_name: "A. Johnson",
  },
  {
    sku_id: "SKU-1002",
    name: "Safety Helmet",
    unit_price: 39,
    stock_quantity: 14,
    reorder_point: 25,
    expire_date: "2026-09-15",
    category_name: "Safety",
    supplier_name: "North Peak Industrial",
    manager_name: "M. Patel",
  },
  {
    sku_id: "SKU-1003",
    name: "Hydraulic Pump",
    unit_price: 620,
    stock_quantity: 8,
    reorder_point: 10,
    expire_date: "2026-06-01",
    category_name: "Machinery",
    supplier_name: "Prime Motion Ltd.",
    manager_name: "R. Chen",
  },
]