import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import Loading from "../components/Loading"
import { getRestaurantMenu } from "../api"

export default function Restaurant() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cart, dispatch, total } = useCart()
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")

  useEffect(() => {
    dispatch({ type: "SET_RESTAURANT", restaurant: parseInt(id) })
    getRestaurantMenu(id).then((data) => {
      setMenu(data)
      if (data.length > 0 && data[0].items.length > 0) setName(data[0].items[0].name || "")
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const addItem = (item) => {
    dispatch({ type: "ADD", item: { menu_item_id: item.id, name: item.name, price: item.price, image_url: item.image_url } })
  }

  const updateQty = (itemId, qty) => dispatch({ type: "UPDATE_QTY", id: itemId, qty })

  if (loading) return <Loading />
  return (
    <div className="menu-container">
      <h1 style={{ marginBottom: 20 }}>{name || "Menu"}</h1>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate("/")} style={{ marginBottom: 20 }}>Back to restaurants</button>
      {menu.map((cat) => (
        <div key={cat.id} className="menu-category">
          <h2>{cat.name}</h2>
          {cat.items.map((item) => {
            const cartItem = cart.items.find((i) => i.menu_item_id === item.id)
            return (
              <div key={item.id} className="menu-item">
                <div>
                  <h4>{item.name}</h4>
                  {item.description && <p>{item.description}</p>}
                  <span className="price">${item.price.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {cartItem ? (
                    <>
                      <button className="btn btn-sm btn-secondary" onClick={() => updateQty(item.id, cartItem.quantity - 1)}>-</button>
                      <span style={{ fontWeight: 600, minWidth: 20, textAlign: "center" }}>{cartItem.quantity}</span>
                      <button className="btn btn-sm btn-primary" onClick={() => addItem(item)}>+</button>
                    </>
                  ) : (
                    <button className="btn btn-sm btn-primary" onClick={() => addItem(item)}>Add</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
      {cart.items.length > 0 && (
        <div className="cart-summary">
          <span className="total">Total: ${total.toFixed(2)}</span>
          <button className="btn btn-primary" onClick={() => navigate("/checkout")}>View Cart</button>
        </div>
      )}
    </div>
  )
}