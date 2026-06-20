import { useState, useEffect, useCallback } from "react"
import api from "../api"
import Loading from "../components/Loading"

export default function RiderCompleted() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await api.get("/riders/my-orders")
      setOrders(res.data.filter(o => o.status === "delivered" || o.status === "cancelled"))
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <Loading />
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Completed Orders</h1>
      {orders.length === 0 ? <p style={{ color: "#999", textAlign: "center", padding: 40 }}>No completed orders</p> :
        orders.map((o) => (
          <div key={o.id} className="card" style={{ marginBottom: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>{o.restaurant_name}</h4>
              <span style={{ padding: "2px 8px", borderRadius: 8, fontSize: 12,
                background: o.status === "delivered" ? "#d4edda" : "#f8d7da",
                color: o.status === "delivered" ? "#155724" : "#721c24" }}>
                {o.status === "delivered" ? "Delivered" : "Cancelled"}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#666", margin: "4px 0" }}>#{o.order_number} | ${o.total.toFixed(2)}</p>
            <p style={{ fontSize: 12, color: "#999" }}>{new Date(o.created_at).toLocaleString()}</p>
          </div>
        ))
      }
    </div>
  )
}