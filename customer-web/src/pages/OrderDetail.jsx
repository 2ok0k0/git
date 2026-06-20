import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Loading from "../components/Loading"
import { getOrder, cancelOrder } from "../api"

const statusLabels = {
  pending: "Pending", accepted: "Accepted", preparing: "Preparing",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled"
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const load = () => getOrder(id).then(setOrder).catch(console.error).finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return
    setCancelling(true)
    try { await cancelOrder(id); load() } catch (e) { alert(e.response?.data?.detail || "Failed") }
    setCancelling(false)
  }

  if (loading) return <Loading />
  if (!order) return <div className="page-header"><h1>Order not found</h1></div>

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 20 }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate("/orders")} style={{ marginBottom: 16 }}>Back to Orders</button>
      <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2>Order #{order.order_number}</h2>
          <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 13, fontWeight: 500, background: "#f0f0f0" }}>{statusLabels[order.status] || order.status}</span>
        </div>
        <div style={{ marginBottom: 16, color: "#666", fontSize: 14 }}>
          <p><strong>Restaurant:</strong> {order.restaurant_name}</p>
          <p><strong>Delivery to:</strong> {order.delivery_address}</p>
          {order.rider_name && <p><strong>Rider:</strong> {order.rider_name}</p>}
          <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <h3 style={{ marginBottom: 8 }}>Items</h3>
        {order.items.map((item) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
            <span>{item.item_name} x{item.quantity}</span>
            <span>${item.total_price.toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontWeight: 600, fontSize: 16 }}>
          <span>Delivery Fee</span><span>${(order.delivery_fee || 0).toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontWeight: 600, fontSize: 18, color: "#d83765" }}>
          <span>Total</span><span>${order.total.toFixed(2)}</span>
        </div>
        {["pending", "accepted"].includes(order.status) && (
          <button className="btn btn-sm" style={{ marginTop: 16, background: "#f8d7da", color: "#721c24", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }} onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
      </div>
    </div>
  )
}