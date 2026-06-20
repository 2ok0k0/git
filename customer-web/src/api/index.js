import axios from "axios"

const api = axios.create({ baseURL: "/api" })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = "Bearer " + token
  return config
})

api.interceptors.response.use(
  (r) => r,
  (e) => { if (e.response?.status === 401) { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login" }; return Promise.reject(e) }
)

export const login = (email, password) => api.post("/auth/login", { email, password }).then((r) => r.data)
export const register = (data) => api.post("/auth/register", data).then((r) => r.data)
export const getMe = () => api.get("/auth/me").then((r) => r.data)
export const getRestaurants = () => api.get("/restaurants").then((r) => r.data)
export const getRestaurantMenu = (id) => api.get("/restaurants/" + id + "/menu").then((r) => r.data)
export const createOrder = (data) => api.post("/orders", data).then((r) => r.data)
export const getOrders = () => api.get("/orders").then((r) => r.data)
export const getOrder = (id) => api.get("/orders/" + id).then((r) => r.data)
export const cancelOrder = (id) => api.put("/orders/" + id + "/cancel").then((r) => r.data)
export default api
export const getSalesAnalytics = () => api.get("/admin/analytics/sales").then((r) => r.data)
export const getTopItems = (limit = 10) => api.get("/admin/analytics/top-items?limit=" + limit).then((r) => r.data)
export const getUserGrowth = () => api.get("/admin/analytics/user-growth").then((r) => r.data)
export const getRiderPerformance = () => api.get("/admin/analytics/rider-performance").then((r) => r.data)
export const getSalesByDay = (days = 30) => api.get("/admin/analytics/sales-by-day?days=" + days).then((r) => r.data)
export const getOrderStatusDistribution = () => api.get("/admin/analytics/order-status-distribution").then((r) => r.data)
export const getUsers = () => api.get("/admin/users").then((r) => r.data)
