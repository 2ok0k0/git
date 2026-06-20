import { useState, useEffect, useCallback } from "react"
import api from "../api"
import Loading from "../components/Loading"

export default function RiderAvailable() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [success, setSuccess] = useState("")

  const load = useCallback(async () => {
    try {
      const res = await api.get("/riders/available-orders")
      setOrders(res.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const acceptOrder = async (id) => {
    setAccepting(id)
    try {
      await api.put("/riders/orders/" + id + "/accept")
      setSuccess("Order accepted! Moving to My Orders...")
      setTimeout(() => setSuccess(""), 3000)
      load()
    } catch (e) { alert(e.response?.data?.detail || "Error") }
    setAccepting(null)
  }

  if (loading) return <Loading />
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Available Orders</h1>
      {success && (
        <div style={{
          position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
          background: "#d4edda", color: "#155724", padding: "12px 28px",
          borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          zIndex: 300, fontSize: 14, fontWeight: 500,
          animation: "fadeIn 0.3s ease"
        }}>{success}</div>
      )}
      {orders.length === 0 ? <p style={{ color: "#999", textAlign: "center", padding: 40 }}>No available orders</p> :
        orders.map((o) => (
          <div key={o.id} className="card" style={{ marginBottom: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4>{o.restaurant_name}</h4>
                <p style={{ fontSize: 13, color: "#666" }}>#{o.order_number} | ${o.total.toFixed(2)} | ~{o.estimated_time} min | {o.item_count} items</p>
                <p style={{ fontSize: 13, color: "#666" }}>Deliver to: {o.delivery_address}</p>
              </div>
              <button className="btn btn-primary btn-sm"
                disabled={accepting === o.id}
                onClick={() => acceptOrder(o.id)}>
                {accepting === o.id ? "Accepting..." : "Accept"}
              </button>
            </div>
          </div>
        ))
      }
    </div>
  )
}