import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../api"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState("email")
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const requestReset = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post("/auth/forgot-password?email=" + email)
      setToken(res.data.reset_token)
      setMessage("Reset token: " + res.data.reset_token)
      setStep("reset")
    } catch (err) { setError(err.response?.data?.detail || "Failed") }
  }

  const doReset = async (e) => {
    e.preventDefault()
    try {
      await api.post("/auth/reset-password?token=" + token + "&new_password=" + newPassword)
      setStep("done")
    } catch (err) { setError(err.response?.data?.detail || "Failed") }
  }

  if (step === "done") return (
    <div className="form-container">
      <h2>Password Reset</h2>
      <p style={{ textAlign: "center", marginBottom: 16, color: "#155724", background: "#d4edda", padding: 12, borderRadius: 8 }}>Password reset successfully!</p>
      <Link to="/login" className="submit-btn" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>Go to Login</Link>
    </div>
  )

  return (
    <div className="form-container">
      <h2>{step === "email" ? "Forgot Password" : "Reset Password"}</h2>
      {error && <div className="error-msg">{error}</div>}
      {message && <div style={{ background: "#fff3cd", color: "#856404", padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{message}</div>}
      {step === "email" ? (
        <form onSubmit={requestReset}>
          <div className="form-group"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <button type="submit" className="submit-btn">Send Reset Code</button>
          <div className="auth-link"><Link to="/login">Back to Login</Link></div>
        </form>
      ) : (
        <form onSubmit={doReset}>
          <div className="form-group"><label>New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
          <button type="submit" className="submit-btn">Reset Password</button>
        </form>
      )}
    </div>
  )
}