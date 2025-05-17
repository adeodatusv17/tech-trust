"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useUser } from "../lib/hooks/auth-helper"
import Link from "next/link"
import { ShoppingBag, Search, Clock, ArrowDown, ArrowUp, Check, Filter, Trash2, ChevronRight } from "lucide-react"
import type { Listing } from "@/types/listing"

export default function UserListings() {
  const { user } = useUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

  const handleDelete = async (id: string) => {
  const confirmDelete = confirm("Are you sure you want to delete this listing?")
  if (!confirmDelete) return

  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Remove the deleted listing from UI
    setListings((prev) => prev.filter((listing) => listing.id !== id))
  } catch (err: any) {
    alert(err.message || "Failed to delete the listing.")
  }
}

  
  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        let query = supabase.from('listings').select('*')
        
        if (filterType !== 'all') {
          query = query.eq('type', filterType)
        }
        
        query = query.eq('user_id', user.id)
        
        // Apply sorting
        if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false })
        } else if (sortBy === 'oldest') {
          query = query.order('created_at', { ascending: true })
        } else if (sortBy === 'price') {
          query = query.order('price', { ascending: true })
        }
        
        const { data, error } = await query
        
        if (error) throw error
        setListings(data || [])
      } catch (err: any) {
        setError(err.message || "Failed to load listings")
      } finally {
        setLoading(false)
      }
    }
    
    fetchListings()
  }, [user, filterType, sortBy])
  
  const handleFilterChange = (type: string) => {
    setFilterType(type)
  }
  
  const handleSortChange = (type: string) => {
    setSortBy(type)
    setSortDropdownOpen(false)
  }
  
  if (!user) {
    return (
      <div className="container">
        <div className="no-listings">
          <h2>User Listings</h2>
          <p>Please sign in to view your listings.</p>
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading your listings...</div>
      </div>
    )
  }
  
  return (
    <div className="container">
      <div className="listings-container">
        <div className="listings-header">
          <h2>Your Listings</h2>
          <div className="listings-filters">
            {/* Filter Buttons */}
            <div className="filter-buttons">
              <button 
                className={`filter-button ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                <Filter size={16} />
                All
              </button>
              <button 
                className={`filter-button ${filterType === 'buy' ? 'active' : ''}`}
                onClick={() => handleFilterChange('buy')}
              >
                <ShoppingBag size={16} />
                Buying
              </button>
              <button 
                className={`filter-button ${filterType === 'sell' ? 'active' : ''}`}
                onClick={() => handleFilterChange('sell')}
              >
                <ChevronRight size={16} />
                Selling
              </button>
            </div>
            
            {/* Sort Dropdown */}
            <div className="filter-dropdown">
              <button 
                className="dropdown-toggle" 
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              >
                Sort by: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Price'}
                {sortDropdownOpen ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </button>
              
              {sortDropdownOpen && (
                <div className="dropdown-menu show">
                  <div 
                    className={`dropdown-item ${sortBy === 'newest' ? 'active' : ''}`}
                    onClick={() => handleSortChange('newest')}
                  >
                    Newest
                    {sortBy === 'newest' && <Check size={16} />}
                  </div>
                  <div 
                    className={`dropdown-item ${sortBy === 'oldest' ? 'active' : ''}`}
                    onClick={() => handleSortChange('oldest')}
                  >
                    Oldest
                    {sortBy === 'oldest' && <Check size={16} />}
                  </div>
                  <div 
                    className={`dropdown-item ${sortBy === 'price' ? 'active' : ''}`}
                    onClick={() => handleSortChange('price')}
                  >
                    Price
                    {sortBy === 'price' && <Check size={16} />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {listings.length === 0 ? (
          <div className="no-listings">
            <p>You don't have any {filterType !== "all" ? filterType : ""} listings yet.</p>
            <Link href="/create-listing" className="button button-primary">
              Create a Listing
            </Link>
          </div>
        ) : (
          <div className="listings-list">
            {listings.map((listing) => (
              <div key={listing.id} className="listing-card">
                <div className="listing-card-content">
                  <h3>{listing.title}</h3>
                  <p className="listing-description">
                    {listing.description.length > 100 ? `${listing.description.slice(0, 100)}...` : listing.description}
                  </p>
                  <div className="listing-meta">
                    <div className={`listing-type ${listing.type}`}>
                      {listing.type === 'buy' ? (
                        <>
                          <ShoppingBag size={14} />
                          Buying
                        </>
                      ) : (
                        <>
                          <ChevronRight size={14} />
                          Selling
                        </>
                      )}
                    </div>
                    <span className="listing-price">${listing.price}</span>
                  </div>
                  <div className="listing-actions">
                    <Link href={`/listings/${listing.id}`} className="button button-outline">
                      View Details
                    </Link>
                    <Link href={`/edit-listing/${listing.id}`} className="button button-primary">
                      Edit
                    </Link>
                    <button className="button button-danger"
                     onClick={() => handleDelete(listing.id)}>
                    <Trash2 size={16}/>Delete</button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
