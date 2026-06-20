import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"

export default function Navbar() {
  const navigate = useNavigate()
  const { cart } = useCart()
  const user = JSON.parse(localStorage.getItem("user") || "null")
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0)

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login") }

  if (!user) return null

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Enatega</Link>
      <div className="nav-links">
        <Link to="/orders">Orders</Link>
        <span style={{ fontSize: 13, opacity: 0.8 }}>{user.name}</span>
        <button className="cart-btn" onClick={() => navigate("/checkout")}>Cart ({itemCount})</button>
        {(user.role === "admin" || user.role === "analyst") && <Link to="/analytics" style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Analytics</Link>}
        <button className="btn btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "white" }} onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}