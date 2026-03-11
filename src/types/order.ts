export type OrderStatus = "Pending" | "Processing" | "Completed"
export type PaymentStatus = "Awaiting Payment" | "Paid"
export type ShipmentStatus = "Not Shipped" | "Label Created" | "In Transit"

export type Order = {
  order_id: string
  customer_name: string
  order_date: string
  total_amount: number
  status: OrderStatus
  payment_status: PaymentStatus
  shipment_status: ShipmentStatus
}