import { Link, useNavigate } from "react-router-dom"

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "null")

  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login") }

  if (!user) return null

  const role = user.role

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Enatega</Link>
      <div className="nav-links">
        <span style={{ fontSize: 13, opacity: 0.8 }}>{user.name}</span>
        {role === "customer" && <Link to="/orders">Orders</Link>}
        {role === "rider" && <Link to="/rider/available">Available</Link>}
        {role === "rider" && <Link to="/rider/orders">My Orders</Link>}
        {role === "rider" && <Link to="/rider/completed">Completed</Link>}
        {role === "merchant" && <Link to="/merchant" style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Store</Link>}
        {(role === "admin" || role === "analyst") && <Link to="/orders">Orders</Link>}
        {(role === "admin" || role === "analyst") && <Link to="/analytics" style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Analytics</Link>}
        {(role === "admin" || role === "merchant") && <Link to="/merchant" style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Store</Link>}
        <button className="btn btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "white" }} onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}