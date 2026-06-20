import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../api"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await login(email, password)
      localStorage.setItem("token", res.token)
      localStorage.setItem("user", JSON.stringify(res.user))
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed")
    }
  }

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="form-group"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button type="submit" className="submit-btn">Login</button>
      </form>
      <div className="auth-link"><Link to="/forgot-password">Forgot password?</Link></div>
      <div className="auth-link">Not registered? <Link to="/register">Create account</Link></div>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button onClick={() => { window.location.href = "http://localhost:3000/api/auth/wechat-login?code=demo" }} style={{ background: "#07C160", color: "white", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: 14 }}>WeChat Login (Demo)</button>
      </div>
    </div>
  )
}