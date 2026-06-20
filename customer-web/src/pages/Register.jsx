import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { register } from "../api"

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await register({ ...form, role: "customer" })
      localStorage.setItem("token", res.token)
      localStorage.setItem("user", JSON.stringify(res.user))
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed")
    }
  }

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  return (
    <div className="form-container">
      <h2>Register</h2>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Name</label><input value={form.name} onChange={update("name")} required /></div>
        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={update("email")} required /></div>
        <div className="form-group"><label>Phone</label><input value={form.phone} onChange={update("phone")} /></div>
        <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={update("password")} required /></div>
        <button type="submit" className="submit-btn">Register</button>
      </form>
      <div className="auth-link">Already have account? <Link to="/login">Login</Link></div>
    </div>
  )
}