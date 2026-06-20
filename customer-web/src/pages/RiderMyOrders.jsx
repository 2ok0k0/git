import { useState, useEffect, useCallback } from "react"
import api from "../api"
import Loading from "../components/Loading"

export default function RiderMyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await api.get("/riders/my-orders")
      setOrders(res.data.filter(o => o.status !== "delivered" && o.status !== "cancelled"))
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const pickupOrder = async (id) => { try { await api.put("/riders/orders/" + id + "/pickup"); load() } catch (e) { console.error(e) } }
  const deliverOrder = async (id) => { try { await api.put("/riders/orders/" + id + "/deliver"); load() } catch (e) { console.error(e) } }

  const badge = (s) => {
    const m = { accepted: "#cce5ff,#004085,Accepted", out_for_delivery: "#d4edda,#155724,Out for Delivery" }
    const [bg, c, l] = (m[s] || "#f0f0f0,#333,"+s).split(",")
    return <span style={{ background: bg, color: c, padding: "2px 8px", borderRadius: 8, fontSize: 12 }}>{l}</span>
  }

  if (loading) return <Loading />
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>My Orders</h1>
      {orders.length === 0 ? <p style={{ color: "#999", textAlign: "center", padding: 40 }}>No active orders</p> :
        orders.map((o) => (
          <div key={o.id} className="card" style={{ marginBottom: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h4>{o.restaurant_name}</h4>
                {badge(o.status)}
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#666", margin: "4px 0" }}>#{o.order_number} | ${o.total.toFixed(2)} | ~{o.estimated_time} min</p>
            <p style={{ fontSize: 13, color: "#666" }}>Deliver to: {o.delivery_address}</p>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              {o.status === "accepted" && <button className="btn btn-sm" style={{ background: "#ffc107", color: "#333" }} onClick={() => pickupOrder(o.id)}>Pick Up</button>}
              {o.status === "out_for_delivery" && <button className="btn btn-sm btn-primary" onClick={() => deliverOrder(o.id)}>Delivered</button>}
            </div>
          </div>
        ))
      }
    </div>
  )
}