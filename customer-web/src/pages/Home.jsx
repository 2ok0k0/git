import { useState, useEffect } from "react"
import RestaurantCard from "../components/RestaurantCard"
import Loading from "../components/Loading"
import { getRestaurants, getFlashSale, getRecommendations } from "../api"

export default function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRestaurants(), getFlashSale(), getRecommendations()]).then(([r, f, rec]) => { setRestaurants(r); setData({flash: f, recs: rec}) }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const flashItems = data.flash || []
  const recItems = data.recs || []

  return (
    <>
      {flashItems.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "20px auto 0", padding: "0 20px" }}>
          <h2 style={{ color: "#d83765", marginBottom: 12 }}>Flash Sale! (Ethical - Reduce Food Waste)</h2>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
            {flashItems.map((item) => (
              <div key={item.id} className="card" style={{ minWidth: 200, padding: 16, flexShrink: 0 }}>
                <h4>{item.name}</h4>
                <p style={{ fontSize: 13, color: "#666" }}>{item.restaurant_name}</p>
                <div style={{ marginTop: 8 }}>
                  <span style={{ textDecoration: "line-through", color: "#999", fontSize: 13 }}>${item.original_price.toFixed(2)}</span>
                  <span style={{ color: "#d83765", fontWeight: 700, fontSize: 18, marginLeft: 8 }}>${item.discounted_price.toFixed(2)}</span>
                  <span style={{ background: "#d83765", color: "white", fontSize: 11, padding: "2px 6px", borderRadius: 4, marginLeft: 6 }}>-{item.discount_percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {recItems.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "20px auto 0", padding: "0 20px" }}>
          <h2 style={{ marginBottom: 12 }}>Recommended for You (AI)</h2>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
            {recItems.map((item, i) => (
              <div key={i} className="card" style={{ minWidth: 160, padding: 16, flexShrink: 0, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🍔</div>
                <h4>{item.name}</h4>
                <p style={{ fontSize: 12, color: "#999" }}>{item.popularity} orders</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="page-header">
        <h1>Restaurants</h1>
        <p>Choose your favorite food</p>
      </div>
      <div className="restaurant-grid">
        {restaurants.map((r) => <RestaurantCard key={r.id} r={r} />)}
      </div>
    </>
  )
}