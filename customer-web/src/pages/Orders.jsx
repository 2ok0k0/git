import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Loading from "../components/Loading"
import { getOrders } from "../api"

const statusColors = {
  pending: "status-pending", accepted: "status-accepted",
  out_for_delivery: "status-out_for_delivery", delivered: "status-delivered",
  cancelled: "status-cancelled"
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getOrders().then(setOrders).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />
  return (
    <>
      <div className="page-header"><h1>My Orders</h1><p>Track your food delivery</p></div>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px 60px" }}>
        {orders.length === 0 ? <p style={{ textAlign: "center", color: "#999", padding: 40 }}>No orders yet</p> :
          orders.map((o) => (
            <div key={o.id} className="order-card" onClick={() => navigate("/orders/" + o.id)} style={{ cursor: "pointer" }}>
              <div className="order-info">
                <h4>{o.restaurant_name}</h4>
                <p>#{o.order_number} | ${o.total.toFixed(2)} | {new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <span className={"status " + (statusColors[o.status] || "")}>{o.status.replace(/_/g, " ")}</span>
            </div>
          ))
        }
      </div>
    </>
  )
}