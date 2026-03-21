export type Role = "admin" | "manager" | "employee";

export interface User {
  id: string;
  username: string;
  role: Role;
  security_level?: string;
  department?: string;
  access_level?: string;
  position?: string;
  full_name?: string;
  last_login?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  category_id: string;
  category_name: string;
  description?: string;
}

export interface Product {
  sku_id: string;
  name: string;
  description?: string;
  category_name?: string;
  category_id?: string;
  stock_quantity: number;
  reorder_point: number;
  unit_price: number;
  supplier_id?: string;
  supplier_name?: string;
  warehouse_id?: string;
  warehouse_name?: string;
  expiry_date?: string;
  days_left?: number;
  image_url?: string;
  created_at?: string;
}

export interface Order {
  order_id: string;
  customer_id?: string;
  customer_name?: string;
  order_date: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  sku_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
}

export interface Supplier {
  supplier_id: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  category_type?: string;
  status: "active" | "inactive";
  created_at?: string;
}

export interface Warehouse {
  warehouse_id: string;
  location_name: string;
  address?: string;
  capacity: number;
  used: number;
  manager?: string;
  created_at?: string;
}

export interface Report {
  report_id: string;
  admin_id: string;
  admin_username?: string;
  date: string;
  summary?: string;
  type: "weekly" | "monthly" | "custom";
  created_at?: string;
}

export interface ExpiryAlert {
  sku_id: string;
  name: string;
  expiry_date: string;
  days_left: number;
  stock_quantity: number;
  supplier_name?: string;
  warehouse_name?: string;
  category_name?: string;
}