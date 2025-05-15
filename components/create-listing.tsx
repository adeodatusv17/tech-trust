"use client"

import { useState, useEffect } from "react"
import { useListings } from "./listings-provider"
import { ShoppingBag, Search, Upload } from "lucide-react"
import { useUser } from '../lib/hooks/auth-helper'

export default function CreateListing() {
  const { addListing } = useListings()
  const { user } = useUser()
  console.log("User data:", user)
  const [listingType, setListingType] = useState<"sell" | "buy">("sell")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Electronics")
  const [price, setPrice] = useState("")
  const [budget, setBudget] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [contactName, setContactName] = useState("")
  const [contactNumber, setContactNumber] = useState("")

  // Pre-fill contact name with user information
  useEffect(() => {
    if (user?.user_metadata?.name) {
      setContactName(user.user_metadata.name)
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert("You must be signed in to create a listing")
      return
    }
    
    // Create listing object WITH email (this was missing before)
    const newListing = {
      // Remove id and created_at as they will be handled by the provider
      type: listingType,
      title,
      description,
      category,
      price: listingType === "sell" ? parseFloat(price) : 0,
      budget: listingType === "buy" ? parseFloat(budget) : 0,
      images,
      contact_name: contactName.toString(),
      contact_number: contactNumber.toString(),
      user_id: user.id,
      email: user.email || '' // Add the email field from the user object
    }
    
    addListing(newListing)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageUrls = files.map(file => URL.createObjectURL(file))
    setImages(prev => [...prev, ...imageUrls].slice(0, 5))
  }

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'contactName') setContactName(value);
  }
  
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    
    if (name === 'price') setPrice(numericValue);
    if (name === 'budget') setBudget(numericValue);
    if (name === 'contactNumber') setContactNumber(numericValue);
  }
  
  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      {/* Auth check message */}
      {!user && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded border border-yellow-300">
          You need to sign in before creating a listing.
        </div>
      )}

      {/* Rest of your form stays the same */}
      {/* ... */}

      <button 
        type="submit" 
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        disabled={!user}
      >
        Create Listing
      </button>
    </form>
  )
}
