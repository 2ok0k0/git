import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend
} from "chart.js"
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2"
import Loading from "../components/Loading"
import {
  getSalesAnalytics, getTopItems, getUserGrowth, getRiderPerformance,
  getSalesByDay, getOrderStatusDistribution
} from "../api"

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend)

export default function Analytics() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({})

  useEffect(() => {
    if (!["admin", "analyst"].includes(user.role)) { navigate("/"); return }
    Promise.all([
      getSalesAnalytics(), getTopItems(), getUserGrowth(), getRiderPerformance(),
      getSalesByDay(), getOrderStatusDistribution()
    ]).then(([sales, topItems, userGrowth, riders, salesByDay, statusDist]) => {
      setData({ sales, topItems, userGrowth, riders, salesByDay, statusDist })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const chartColors = ["#d83765", "#febb2c", "#36a2eb", "#4bc0c0", "#9966ff", "#ff9f40"]

  // Sales trend line chart
  const salesTrend = {
    labels: (data.salesByDay || []).map((d) => d.date.slice(5)),
    datasets: [{
      label: "Revenue",
      data: (data.salesByDay || []).map((d) => d.revenue),
      borderColor: "#d83765", backgroundColor: "rgba(216,55,101,0.1)", fill: true, tension: 0.3
    }]
  }

  // Top items bar chart
  const topItemsChart = {
    labels: (data.topItems || []).map((i) => i.name),
    datasets: [{
      label: "Quantity Sold",
      data: (data.topItems || []).map((i) => i.quantity),
      backgroundColor: chartColors
    }]
  }

  // User growth
  const userGrowthChart = {
    labels: (data.userGrowth || []).map((d) => d.date.slice(5)),
    datasets: [{
      label: "New Users",
      data: (data.userGrowth || []).map((d) => d.count),
      borderColor: "#36a2eb", backgroundColor: "rgba(54,162,235,0.1)", fill: true, tension: 0.3
    }]
  }

  // Order status distribution
  const statusChart = {
    labels: (data.statusDist || []).map((s) => s.status.replace(/_/g, " ")),
    datasets: [{
      data: (data.statusDist || []).map((s) => s.count),
      backgroundColor: chartColors
    }]
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 24 }}>Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 30 }}>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <h3 style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>Total Revenue</h3>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#d83765" }}>${(data.sales?.total_revenue || 0).toFixed(2)}</p>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <h3 style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>Total Orders</h3>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#333" }}>{data.sales?.total_orders || 0}</p>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <h3 style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>Avg Order Value</h3>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#36a2eb" }}>${(data.sales?.avg_order_value || 0).toFixed(2)}</p>
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <h3 style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>Top Riders</h3>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#4bc0c0" }}>{(data.riders || []).length > 0 ? data.riders[0].rider_name : "N/A"}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 24 }}>
        {/* Sales Trend */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Sales Trend (30 days)</h3>
          {(data.salesByDay || []).length > 0 ? <Line data={salesTrend} options={{ responsive: true }} /> : <p style={{ color: "#999" }}>No sales data yet</p>}
        </div>

        {/* Top Items */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Popular Items</h3>
          {(data.topItems || []).length > 0 ? <Bar data={topItemsChart} options={{ responsive: true, indexAxis: "y" }} /> : <p style={{ color: "#999" }}>No items data yet</p>}
        </div>

        {/* User Growth */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>User Growth</h3>
          {(data.userGrowth || []).length > 0 ? <Line data={userGrowthChart} options={{ responsive: true }} /> : <p style={{ color: "#999" }}>No user data yet</p>}
        </div>

        {/* Order Status Distribution */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Order Status</h3>
          {(data.statusDist || []).length > 0 ? <Doughnut data={statusChart} options={{ responsive: true }} /> : <p style={{ color: "#999" }}>No order data yet</p>}
        </div>
      </div>

      {/* Rider Performance Table */}
      <h2 style={{ marginTop: 40, marginBottom: 16 }}>Rider Performance</h2>
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f8f8", textAlign: "left" }}>
              <th style={{ padding: "12px 16px" }}>Rider</th>
              <th style={{ padding: "12px 16px" }}>Completed Orders</th>
              <th style={{ padding: "12px 16px" }}>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(data.riders || []).length > 0 ? data.riders.map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 16px" }}>{r.rider_name}</td>
                <td style={{ padding: "12px 16px" }}>{r.completed_orders}</td>
                <td style={{ padding: "12px 16px" }}>${(r.total_revenue || 0).toFixed(2)}</td>
              </tr>
            )) : <tr><td colSpan="3" style={{ padding: 20, textAlign: "center", color: "#999" }}>No rider data yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}