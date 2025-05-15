"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useUser } from "../lib/hooks/auth-helper"
import Link from "next/link"
import { ShoppingBag, Search, Clock, ArrowDown, ArrowUp } from "lucide-react"
import type { Listing } from "@/types/listing"

export default function UserListings() {
  const { user } = useUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState("latest")
  const [filterType, setFilterType] = useState("all")

  const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  })
  if (error) console.error("OAuth Login failed:", error.message)
}

  
  // Fetch user's listings when component mounts
  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      setError(null)
      
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', user.id)
          
        if (error) throw error
        setListings(data || [])
      } catch (error: any) {
        console.error("Error fetching listings:", error)
        setError(error.message || "Failed to fetch your listings")
      } finally {
        setLoading(false)
      }
    }
    
    fetchListings()
  }, [user])
  
  // Apply filtering based on listing type
  const filteredListings = listings.filter(listing => {
    if (filterType === "all") return true
    return listing.type === filterType
  })
  
  // Apply sorting based on selected option
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortOption) {
      case "latest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "price-high":
        return (b.type === "sell" ? b.price : b.budget) - (a.type === "sell" ? a.price : a.budget)
      case "price-low":
        return (a.type === "sell" ? a.price : a.budget) - (b.type === "sell" ? b.price : b.budget)
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  // Format date for display
  function formatDate(dateString: string | Date) {
    const date = new Date(dateString);
    const now = new Date();
    
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  return (
    <div className="container">
      <div className="my-listings">
        <h1>My Listings</h1>
        
        {!user ? (
          <div className="no-listings">
            <p>Please sign in to view your listings.</p>
            <button onClick={handleLogin} className="button button-primary">
  Sign In with Google
</button>

          </div>
        ) : loading ? (
          <div className="loading">Loading your listings...</div>
        ) : error ? (
          <div className="no-listings">
            <p>{error}</p>
            <button 
              className="button button-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="listings-controls">
              <div className="filter-options">
                <button
                  className={`button ${filterType === "all" ? "button-primary" : "button-outline"}`}
                  onClick={() => setFilterType("all")}
                >
                  All
                </button>
                <button
                  className={`button ${filterType === "sell" ? "button-primary" : "button-outline"}`}
                  onClick={() => setFilterType("sell")}
                >
                  <ShoppingBag size={16} />
                  Selling
                </button>
                <button
                  className={`button ${filterType === "buy" ? "button-primary" : "button-outline"}`}
                  onClick={() => setFilterType("buy")}
                >
                  <Search size={16} />
                  Looking For
                </button>
              </div>
              
              <div className="sort-options">
                <label>Sort by:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="sort-select"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                </select>
              </div>
            </div>
            
            {sortedListings.length === 0 ? (
              <div className="no-listings">
                <p>You don't have any {filterType !== "all" ? filterType : ""} listings yet.</p>
                <Link href="/create" className="button button-primary">
                  Create a Listing
                </Link>
              </div>
            ) : (
              <div className="listings-list">
                {sortedListings.map(listing => (
                  <div key={listing.id} className="listing-card">
                    <div className="listing-card-content">
                      <h3>{listing.title}</h3>
                      <p className="listing-description">
                        {listing.description.length > 100 
                          ? `${listing.description.slice(0, 100)}...` 
                          : listing.description}
                      </p>
                      <div className="listing-meta">
                        <span className={`listing-type ${listing.type}`}>
                          {listing.type === "sell" ? "Selling" : "Looking For"}
                        </span>
                        {listing.type === "sell" ? (
                          <span className="listing-price">${listing.price}</span>
                        ) : (
                          <span className="listing-price">Budget: ${listing.budget}</span>
                        )}
                      </div>
                      <div className="listing-date">
                        <Clock size={14} className="inline mr-1" />
                        {formatDate(listing.created_at)}
                      </div>
                      <div className="listing-actions">
                        <Link href={`/listings/${listing.id}`} className="button button-outline">
                          View
                        </Link>
                        <Link href={`/edit/${listing.id}`} className="button button-outline">
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
