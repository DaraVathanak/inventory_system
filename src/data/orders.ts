import type { Order } from "@/types/order"

export const orders: Order[] = [
  {
    order_id: "ORD-9001",
    customer_name: "Horizon Retail",
    order_date: "2026-03-08",
    total_amount: 2410,
    status: "Processing",
    payment_status: "Paid",
    shipment_status: "Label Created",
  },
  {
    order_id: "ORD-9002",
    customer_name: "Delta Works",
    order_date: "2026-03-09",
    total_amount: 890,
    status: "Pending",
    payment_status: "Awaiting Payment",
    shipment_status: "Not Shipped",
  },
  {
    order_id: "ORD-9003",
    customer_name: "Summit Build",
    order_date: "2026-03-10",
    total_amount: 5730,
    status: "Completed",
    payment_status: "Paid",
    shipment_status: "In Transit",
  },
]