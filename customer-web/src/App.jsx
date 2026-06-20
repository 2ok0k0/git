import { Routes, Route, Navigate } from "react-router-dom"
import { CartProvider } from "./context/CartContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import Register from "./pages/Register"
import Restaurant from "./pages/Restaurant"
import Checkout from "./pages/Checkout"
import Orders from "./pages/Orders"
import OrderDetail from "./pages/OrderDetail"
import Analytics from "./pages/Analytics"

function Protected({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <main style={{ paddingTop: 70 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Home /></Protected>} />
          <Route path="/restaurant/:id" element={<Protected><Restaurant /></Protected>} />
          <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
          <Route path="/orders" element={<Protected><Orders /></Protected>} />
          <Route path="/orders/:id" element={<Protected><OrderDetail /></Protected>} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
        </Routes>
      </main>
    </CartProvider>
  )
}