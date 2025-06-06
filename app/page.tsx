import ListingsList from '@/app/client-components/listings-list'
import Link from "next/link"
import { ShoppingBag, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Welcome to Tech Trust </h1>
        <p>Providing Students access to subsidised laptops </p>
        <Link href="/create">
         
        </Link>
      </div>
      <div className="listings-container">
        <h2>Recent Listings</h2>
        <ListingsList />
      </div>
    </div>
  )
}

