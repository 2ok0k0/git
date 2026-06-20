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
import RiderAvailable from "./pages/RiderAvailable"
import RiderMyOrders from "./pages/RiderMyOrders"
import RiderCompleted from "./pages/RiderCompleted"
import MerchantDashboard from "./pages/MerchantDashboard"

function Protected({ children, roles }) {
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  if (!token) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return children
}

function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  if (!localStorage.getItem("token")) return <Navigate to="/login" />
  if (user.role === "rider") return <Navigate to="/rider/available" />
  if (user.role === "merchant") return <Navigate to="/merchant" />
  return <Home />
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
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/customer-home" element={<Protected roles={["customer","admin","analyst"]}><Home /></Protected>} />
          <Route path="/restaurant/:id" element={<Protected><Restaurant /></Protected>} />
          <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
          <Route path="/orders" element={<Protected><Orders /></Protected>} />
          <Route path="/orders/:id" element={<Protected><OrderDetail /></Protected>} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/rider/available" element={<Protected roles={["rider"]}><RiderAvailable /></Protected>} />
          <Route path="/rider/orders" element={<Protected roles={["rider"]}><RiderMyOrders /></Protected>} />
          <Route path="/rider/completed" element={<Protected roles={["rider"]}><RiderCompleted /></Protected>} />
          <Route path="/merchant" element={<Protected roles={["merchant","admin"]}><MerchantDashboard /></Protected>} />
        </Routes>
      </main>
    </CartProvider>
  )
}