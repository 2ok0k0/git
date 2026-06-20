import { createContext, useContext, useReducer } from "react"

const CartContext = createContext()

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.menu_item_id === action.item.menu_item_id)
      if (existing) return { ...state, items: state.items.map((i) => i.menu_item_id === action.item.menu_item_id ? { ...i, quantity: i.quantity + 1 } : i) }
      return { ...state, items: [...state.items, { ...action.item, quantity: 1 }] }
    }
    case "REMOVE": return { ...state, items: state.items.filter((i) => i.menu_item_id !== action.id) }
    case "UPDATE_QTY": return { ...state, items: state.items.map((i) => i.menu_item_id === action.id ? { ...i, quantity: Math.max(0, action.qty) } : i).filter((i) => i.quantity > 0) }
    case "CLEAR": return { ...state, items: [] }
    case "SET_RESTAURANT": return { ...state, restaurant: action.restaurant, items: state.restaurant && state.restaurant !== action.restaurant ? [] : state.items }
    default: return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], restaurant: null })
  const total = cart.items.reduce((s, i) => s + i.price * i.quantity, 0)
  return <CartContext.Provider value={{ cart, dispatch, total }}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)