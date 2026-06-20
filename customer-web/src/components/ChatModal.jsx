import { useState, useEffect, useRef, useCallback } from "react"
import { sendChat, getChatMessages } from "../api"

export default function ChatModal({ order, onClose, userRole }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [page, setPage] = useState(1)
  const messagesEndRef = useRef(null)

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await getChatMessages(order.id)
      setMessages(msgs)
    } catch (e) { console.error(e) }
  }, [order.id])

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const doSend = async () => {
    if (!input.trim()) return
    const name = userRole === "merchant" ? "Merchant" : "You"
    try {
      await sendChat(order.id, userRole, input.trim(), name)
      setInput("")
      loadMessages()
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200
    }} onClick={onClose}>
      <div className="card" style={{ width: 400, maxHeight: 500, display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: 16, borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>Chat - #{order.order_number}</h4>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>x</button>
        </div>
        <div style={{ flex: 1, padding: 16, overflowY: "auto", maxHeight: 300 }}>
          {messages.length === 0 && <p style={{ textAlign: "center", color: "#999", fontSize: 13 }}>No messages yet</p>}
          {messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: 8, padding: "8px 12px", borderRadius: 8, fontSize: 14,
              background: msg.sender === "merchant" ? "#d83765" : "#f0f0f0",
              color: msg.sender === "merchant" ? "white" : "#333",
              textAlign: msg.sender === "merchant" ? "right" : "left",
              maxWidth: "80%", marginLeft: msg.sender === "merchant" ? "auto" : 0
            }}>
              <small style={{ opacity: 0.7, display: "block", fontSize: 11, marginBottom: 2 }}>
                {msg.sender_name || (msg.sender === "merchant" ? "Merchant" : "Customer")}
              </small>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: 12, borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSend()}
            placeholder="Type a message..." style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", outline: "none" }} />
          <button className="btn btn-sm btn-primary" onClick={doSend}>Send</button>
        </div>
      </div>
    </div>
  )
}