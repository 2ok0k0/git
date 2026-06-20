import { useState, useEffect } from "react"
import Loading from "../components/Loading"
import api from "../api"
import ChatModal from "../components/ChatModal"

export default function MerchantDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [expanded, setExpanded] = useState({})
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  // Chat state
  const [chatOrder, setChatOrder] = useState(null)
  const [unreadMap, setUnreadMap] = useState({})

  // Track unread messages per order
  const checkUnread = async (orderList) => {
    for (const o of orderList) {
      try {
        const r = await fetch("/api/chat/messages/" + o.id)
        const msgs = await r.json()
        const unread = msgs.filter(m => m.sender !== "merchant").length
        setUnreadMap(prev => {
          const current = prev[o.id] || 0
          if (unread > 0 && current === 0) return { ...prev, [o.id]: unread }
          return prev
        })
      } catch (e) {}
    }
  }

  const loadOrders = async () => {
    try {
      const res = await api.get("/merchant/orders" + (filter ? "?status=" + filter : ""))
      setOrders(res.data)
      checkUnread(res.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadOrders() }, [filter])

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

    const openChat = (order) => {
    setChatOrder(order)
    setUnreadMap(prev => ({ ...prev, [order.id]: 0 }))
  }

  const statusBadge = (status) => {
    const m = { pending: "#fff3cd,#856404,Pending", accepted: "#cce5ff,#004085,Accepted", preparing: "#fff3cd,#856404,Preparing", out_for_delivery: "#d4edda,#155724,Out for Delivery", delivered: "#d4edda,#155724,Delivered", cancelled: "#f8d7da,#721c24,Cancelled" }
    const [bg, color, label] = (m[status] || "#f0f0f0,#333," + status).split(",")
    return <span style={{ background: bg, color: color, padding: "2px 8px", borderRadius: 8, fontSize: 12, fontWeight: 500 }}>{label}</span>
  }

  if (loading) return <Loading />

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 24 }}>Merchant Dashboard</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button className={"btn btn-sm " + (!filter ? "btn-primary" : "btn-secondary")} onClick={() => setFilter("")}>All</button>
        <button className={"btn btn-sm " + (filter === "pending" ? "btn-primary" : "btn-secondary")} onClick={() => setFilter("pending")}>Pending</button>
        <button className={"btn btn-sm " + (filter === "accepted" ? "btn-primary" : "btn-secondary")} onClick={() => setFilter("accepted")}>Accepted</button>
        <button className={"btn btn-sm " + (filter === "out_for_delivery" ? "btn-primary" : "btn-secondary")} onClick={() => setFilter("out_for_delivery")}>Out for Delivery</button>
        <button className={"btn btn-sm " + (filter === "delivered" ? "btn-primary" : "btn-secondary")} onClick={() => setFilter("delivered")}>Delivered</button>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "#999" }}>No orders found</div>
      ) : orders.map((o) => (
        <div key={o.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ padding: 16, cursor: "pointer" }} onClick={() => toggleExpand(o.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h4>#{o.order_number}</h4>
                  {statusBadge(o.status)}
                </div>
                <p style={{ fontSize: 13, color: "#666" }}>{o.customer_name} | ${o.total.toFixed(2)} | {new Date(o.created_at).toLocaleString()}</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#d83765", fontWeight: 500 }}>
                  {o.rider_name ? (o.estimated_pickup || "Rider assigned") : "Waiting for rider..."}
                </span>
                <div style={{ position: "relative", display: "inline-block" }}>
                    <button className="btn btn-sm" style={{ background: "#07C160", color: "white" }}
                      onClick={(e) => { e.stopPropagation(); openChat(o) }}>
                      Contact
                    </button>
                    {unreadMap[o.id] > 0 && (
                      <span style={{
                        position: "absolute", top: -4, right: -4, background: "red", color: "white",
                        borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>{unreadMap[o.id]}</span>
                    )}
                  </div>
              </div>
            </div>
          </div>
          {expanded[o.id] && (
            <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
              <h4 style={{ marginBottom: 8 }}>Order Items</h4>
              {o.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, borderBottom: "1px solid #f5f5f5" }}>
                  <span>{item.name} x{item.qty}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
              {o.notes && <p style={{ marginTop: 8, fontSize: 13, fontStyle: "italic", color: "#666" }}>Notes: {o.notes}</p>}
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                {o.rider_name && <span style={{ fontSize: 13, color: "#666" }}>Rider: {o.rider_name}</span>}
                {o.estimated_pickup && <span style={{ fontSize: 13, color: "#d83765", fontWeight: 500 }}>{o.estimated_pickup}</span>}
              </div>
            </div>
          )}
        </div>
      ))}

      {chatOrder && <ChatModal order={chatOrder} onClose={() => setChatOrder(null)} userRole="merchant" />}
    </div>
  )
}