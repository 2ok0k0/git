import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Loading from "../components/Loading"
import { getOrder, cancelOrder } from "../api"
import ChatModal from "../components/ChatModal"

const statusLabels = {
  pending: "Pending", accepted: "Accepted", preparing: "Preparing",
  out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled"
}

// Progress steps definition
const progressSteps = [
  { label: "Ordered", statuses: ["pending", "accepted", "preparing", "out_for_delivery", "delivered"] },
  { label: "Accepted", statuses: ["accepted", "preparing", "out_for_delivery", "delivered"] },
  { label: "Picked Up", statuses: ["out_for_delivery", "delivered"] },
  { label: "Delivered", statuses: ["delivered"] }
]

function OrderProgress({ status }) {
  const current = progressSteps.findIndex(s => s.statuses.includes(status))
  if (status === "cancelled") return null
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0", padding: "0 4px" }}>
      {progressSteps.map((step, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
          {i > 0 && (
            <div style={{
              position: "absolute", top: 10, right: "50%", width: "100%", height: 3,
              background: i <= current ? "#d83765" : "#e0e0e0", zIndex: 0
            }} />
          )}
          <div style={{
            width: 22, height: 22, borderRadius: "50%", zIndex: 1,
            background: i <= current ? "#d83765" : "#e0e0e0",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 11, fontWeight: 700
          }}>{i < current ? "+" : i + 1}</div>
          <span style={{ fontSize: 11, marginTop: 4, color: i <= current ? "#d83765" : "#999", fontWeight: i <= current ? 600 : 400 }}>{step.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function OrderDetail() {
  const [showChat, setShowChat] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [chatLastCount, setChatLastCount] = useState(0)
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const load = () => getOrder(id).then(setOrder).catch(console.error).finally(() => setLoading(false))

  useEffect(() => { load(); const interval = setInterval(load, 3000); return () => clearInterval(interval) }, [id])

  // Poll for unread messages
  useEffect(() => {
    if (!id) return
    const check = async () => {
      try {
        const r = await fetch("/api/chat/messages/" + id)
        const msgs = await r.json()
        if (msgs.length > chatLastCount) {
          setUnreadCount(msgs.length - chatLastCount)
        }
      } catch (e) {}
    }
    const interval = setInterval(check, 10000)
    check()
    return () => clearInterval(interval)
  }, [id, chatLastCount])

  const openChat = () => {
    setUnreadCount(0)
    setChatLastCount(prev => prev + unreadCount)
    setShowChat(true)
  }

  const closeChat = () => {
    setShowChat(false)
    fetch("/api/chat/messages/" + id).then(r => r.json()).then(msgs => {
      setChatLastCount(msgs.length)
      setUnreadCount(0)
    }).catch(() => {})
  }

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

        {/* Order Progress Timeline */}
        <OrderProgress status={order.status} />

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
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <div style={{ position: "relative" }}>
              <button className="btn btn-sm" style={{ background: "#07C160", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }} onClick={openChat}>
                Contact Merchant
              </button>
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4, background: "red", color: "white",
                  borderRadius: "50%", width: 20, height: 20, fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{unreadCount}</span>
              )}
            </div>
          )}
          {["pending", "accepted"].includes(order.status) && (
            <button className="btn btn-sm" style={{ background: "#f8d7da", color: "#721c24", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }} onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>
      {showChat && order && <ChatModal order={{ id: order.id, order_number: order.order_number }} onClose={closeChat} userRole="customer" />}
    </div>
  )
}

