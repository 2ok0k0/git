import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { createOrder } from "../api"

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, dispatch, total } = useCart()
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const submitOrder = async () => {
    if (!address.trim()) { setError("Please enter delivery address"); return }
    setSubmitting(true)
    try {
      const res = await createOrder({
        restaurant_id: cart.restaurant,
        items: cart.items.map((i) => ({ menu_item_id: i.menu_item_id, quantity: i.quantity, selected_options: [] })),
        delivery_address: address,
        notes
      })
      dispatch({ type: "CLEAR" })
      navigate("/orders/" + res.id)
    } catch (err) {
      setError(err.response?.data?.detail || "Order failed")
    }
    setSubmitting(false)
  }

  if (cart.items.length === 0) return <div className="page-header"><h1>Cart is empty</h1><p><a href="/">Browse restaurants</a></p></div>

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>Checkout</h1>
      {error && <div className="error-msg">{error}</div>}
      <div style={{ background: "white", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Order Items</h3>
        {cart.items.map((item) => (
          <div key={item.menu_item_id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontWeight: 600, fontSize: 16 }}>
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>
      <div className="form-group"><label>Delivery Address</label><textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your delivery address" /></div>
      <div className="form-group"><label>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions?" style={{ minHeight: 60 }} /></div>
      <button className="submit-btn" onClick={submitOrder} disabled={submitting}>{submitting ? "Placing Order..." : "Place Order"}</button>
    </div>
  )
}