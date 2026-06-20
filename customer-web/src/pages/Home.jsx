import { useState, useEffect } from "react"
import RestaurantCard from "../components/RestaurantCard"
import Loading from "../components/Loading"
import { getRestaurants } from "../api"

export default function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRestaurants().then(setRestaurants).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />
  return (
    <>
      <div className="page-header">
        <h1>Restaurants</h1>
        <p>Choose your favorite food</p>
      </div>
      <div className="restaurant-grid">
        {restaurants.map((r) => <RestaurantCard key={r.id} r={r} />)}
      </div>
    </>
  )
}