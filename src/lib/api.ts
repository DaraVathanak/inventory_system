import { AuthResponse, User, Product, Order, Supplier, Warehouse, Report, Category } from "../types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
export const STATIC_BASE  = API_BASE_URL.replace("/api/v1", "");

const TOKEN_KEY  = "inventory_token";
export const getToken   = () => localStorage.getItem(TOKEN_KEY);
export const setToken   = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ── JSON request ──────────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { message: body.message ?? res.statusText, status: res.status };
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ── Multipart request (for file uploads) ──────────────────────────────────────
async function requestForm<T>(path: string, formData: FormData, method = "POST"): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { message: body.message ?? res.statusText, status: res.status };
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:  (username: string, password: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list:   () => request<User[]>("/users"),
  create: (data: Partial<User> & { password: string }) =>
    request<User>("/users/admins", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<User> & { password?: string }) =>
    request<User>(`/users/admins/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/users/admins/${id}`, { method: "DELETE" }),
};

export const managersApi = {
  create: (data: { username: string; password: string; department?: string; access_level?: string }) =>
    request<User>("/users/managers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { department?: string; access_level?: string; password?: string }) =>
    request<User>(`/users/managers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/users/managers/${id}`, { method: "DELETE" }),
};

// ── Products (multipart for image upload) ─────────────────────────────────────
export const productsApi = {
  list:   (params?: string) => request<Product[]>(`/products${params ? "?" + params : ""}`),
  get:    (id: string) => request<Product>(`/products/${id}`),
  create: (data: Partial<Product> & { imageFile?: File | null }) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === "imageFile") { if (v) fd.append("image", v as File); }
      else if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
    });
    return requestForm<Product>("/products", fd, "POST");
  },
  update: (id: string, data: Partial<Product> & { imageFile?: File | null }) => {
    // If there is an image file, use multipart FormData
    if (data.imageFile) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (k === "imageFile") { fd.append("image", v as File); }
        else if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
      });
      return requestForm<Product>(`/products/${id}`, fd, "PATCH");
    }
    // Otherwise use plain JSON (faster, works for restock etc.)
    const { imageFile: _omit, ...jsonData } = data;
    return request<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(jsonData) });
  },
  delete: (id: string) => request<void>(`/products/${id}`, { method: "DELETE" }),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  list:   (status?: string) => request<Order[]>(`/orders${status ? "?status=" + status : ""}`),
  get:    (id: string) => request<Order>(`/orders/${id}`),
  create: (data: Partial<Order>) =>
    request<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Order>) =>
    request<Order>(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/orders/${id}`, { method: "DELETE" }),
};

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const suppliersApi = {
  list:   () => request<Supplier[]>("/suppliers"),
  create: (data: Partial<Supplier>) =>
    request<Supplier>("/suppliers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Supplier>) =>
    request<Supplier>(`/suppliers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/suppliers/${id}`, { method: "DELETE" }),
};

// ── Warehouses ────────────────────────────────────────────────────────────────
export const warehousesApi = {
  list:   () => request<Warehouse[]>("/warehouses"),
  create: (data: Partial<Warehouse>) =>
    request<Warehouse>("/warehouses", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Warehouse>) =>
    request<Warehouse>(`/warehouses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/warehouses/${id}`, { method: "DELETE" }),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesApi = {
  list:   () => request<Category[]>("/categories"),
  create: (data: { category_name: string; description?: string }) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/categories/${id}`, { method: "DELETE" }),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsApi = {
  list:   (type?: string) => request<Report[]>(`/reports${type ? "?type=" + type : ""}`),
  get:    (id: string) => request<Report>(`/reports/${id}`),
  create: (data: { date?: string; summary?: string; type: string }) =>
    request<Report>("/reports", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { date?: string; summary?: string; type?: string }) =>
    request<Report>(`/reports/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/reports/${id}`, { method: "DELETE" }),
};

// ── Customers ─────────────────────────────────────────────────────────────────
export const customersApi = {
  list:   () => request<{ customer_id: string; name: string; contact?: string; address?: string }[]>("/customers"),
  create: (data: { name: string; contact?: string; address?: string }) =>
    request<{ customer_id: string; name: string }>("/customers", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/customers/${id}`, { method: "DELETE" }),
};

// ── Employees ─────────────────────────────────────────────────────────────────
export const employeesApi = {
  list:   () => request<User[]>("/users/employees"),
  create: (data: { username: string; password: string; full_name?: string; position?: string }) =>
    request<User>("/users/employees", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { full_name?: string; position?: string; password?: string }) =>
    request<User>(`/users/employees/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/users/employees/${id}`, { method: "DELETE" }),
};

// ── Restock Log ───────────────────────────────────────────────────────────────
export interface RestockRecord {
  id: number;
  sku_id: string;
  product_name: string;
  quantity_added: number;
  stock_before: number;
  stock_after: number;
  restocked_by: string;
  restocked_at: string;
  note?: string;
  category_name?: string;
  image_url?: string;
}

export const restockLogApi = {
  list: (sku_id?: string) =>
    request<RestockRecord[]>(`/restock-log${sku_id ? "?sku_id=" + sku_id : ""}`),
  create: (data: {
    sku_id: string;
    product_name: string;
    quantity_added: number;
    stock_before: number;
    stock_after: number;
    note?: string;
  }) => request<RestockRecord>("/restock-log", { method: "POST", body: JSON.stringify(data) }),
  deleteOne:  (id: number)  => request<void>(`/restock-log/${id}`,  { method: "DELETE" }),
  clearAll:   ()            => request<void>("/restock-log",         { method: "DELETE" }),
};