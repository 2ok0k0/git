import { useNavigate } from "react-router-dom"

export default function RestaurantCard({ r }) {
  const navigate = useNavigate()
  return (
    <div className="card restaurant-card" onClick={() => navigate("/restaurant/" + r.id)}>
      <div className="cover">{r.name[0]}</div>
      <div className="info">
        <h3>{r.name}</h3>
        <p style={{ color: "#666", fontSize: 13, marginBottom: 8 }}>{r.description}</p>
        <div className="meta">
          <span>⭐ {r.rating}</span>
          <span>Delivery ${r.delivery_fee}</span>
          <span>{r.estimated_time} min</span>
        </div>
      </div>
    </div>
  )
}