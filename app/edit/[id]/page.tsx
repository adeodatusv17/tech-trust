"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Package, ShoppingCart, ArrowLeft, ImagePlus, X } from "lucide-react"
import type { Listing } from "@/types/listing"
import { use } from "react";
import Link from "next/link"

export default function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const listingId = id;

const [formData, setFormData] = useState<Omit<Listing, "created_at">>({
id: "",
title: "",
description: "",
price: 0,
budget: 0,
type: "sell",
category: "",
images: [],
contact_name: "",
contact_number: "",
email: "",
user_id: ""
})

const [isSubmitting, setIsSubmitting] = useState(false)
const [previews, setPreviews] = useState<string[]>([])
const [files, setFiles] = useState<File[]>([])
const [existingImages, setExistingImages] = useState<string[]>([])
const [isLoading, setIsLoading] = useState(true)

// Fetch listing data
useEffect(() => {
const fetchListing = async () => {
setIsLoading(true)
try {
const { data, error } = await supabase
.from('listings')
.select('*')
.eq('id', listingId)
.single()
    if (error) throw error
    
    if (data) {
      setFormData(data)
      // Set existing images
      if (data.images && data.images.length > 0) {
        setExistingImages(data.images)
      }
    }
  } catch (error) {
    console.error('Error fetching listing:', error)
    alert('Failed to load listing. Please try again.')
  } finally {
    setIsLoading(false)
  }
}

if (listingId) {
  fetchListing()
}

}, [listingId])

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
const { name, value } = e.target
setFormData((prev) => ({ ...prev, [name]: name === "price" || name === "budget" ? parseFloat(value) || 0 : value }))
}

const handleTypeSelect = (type: "sell" | "buy") => {
setFormData((prev) => ({ ...prev, type }))
}

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault()
setIsSubmitting(true)


try {
  let imagePaths = [...existingImages] // Start with existing images
  
  // Upload new images only for sell listings
  if (formData.type === "sell" && files.length > 0) {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`
      const { error } = await supabase.storage
        .from('images') 
        .upload(fileName, file)

      if (error) throw error
      return fileName
    })

    const newImages = await Promise.all(uploadPromises)
    imagePaths = [...imagePaths, ...newImages]
  }

  // Update listing with image paths
  const { data, error } = await supabase
    .from('listings')
    .update({ 
      ...formData, 
      images: imagePaths
    })
    .eq('id', listingId)
    .select()

  if (error) throw error
  router.push("/")
} catch (error) {
  console.error('Error updating listing:', error)
  alert('Failed to update listing. Please try again.')
} finally {
  setIsSubmitting(false)
}

}

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
if (e.target.files && e.target.files.length > 0) {
const newFiles = Array.from(e.target.files)
setFiles(prev => [...prev, ...newFiles])


  // Create preview URLs
  const newPreviews = newFiles.map(file => URL.createObjectURL(file))
  setPreviews(prev => [...prev, ...newPreviews])
}

}

const removeImage = (index: number) => {
const newFiles = [...files]
const newPreviews = [...previews]
newFiles.splice(index, 1)
newPreviews.splice(index, 1)
setFiles(newFiles)
setPreviews(newPreviews)
}

const removeExistingImage = (index: number) => {
const newExistingImages = [...existingImages]
newExistingImages.splice(index, 1)
setExistingImages(newExistingImages)
}

useEffect(() => {
return () => {
previews.forEach(url => URL.revokeObjectURL(url))
}
}, [previews])

if (isLoading) {
return <div>Loading...</div>
}

return (
<div className="create-listing">
<Link href="/" className="inline-flex items-center text-primary-color mb-6 hover:underline">
<ArrowLeft size={16} className="mr-2" />
Back to listings
</Link>


  <h1>Edit Listing</h1>

  <form onSubmit={handleSubmit}>
    <div className="form-group">
      <label htmlFor="type">Listing Type</label>
      <div className="listing-type-options">
        <div
          className={`type-option ${formData.type === "sell" ? "selected" : ""}`}
          onClick={() => handleTypeSelect("sell")}
        >
          <div className="type-option-icon">
            <Package size={20} />
          </div>
          <div className="type-option-text">I want to sell</div>
          <input
            type="radio"
            name="type"
            value="sell"
            checked={formData.type === "sell"}
            onChange={handleChange}
            className="sr-only"
          />
        </div>

        <div
          className={`type-option ${formData.type === "buy" ? "selected" : ""}`}
          onClick={() => handleTypeSelect("buy")}
        >
          <div className="type-option-icon">
            <ShoppingCart size={20} />
          </div>
          <div className="type-option-text">I want to buy</div>
          <input
            type="radio"
            name="type"
            value="buy"
            checked={formData.type === "buy"}
            onChange={handleChange}
            className="sr-only"
          />
        </div>
      </div>
    </div>

    <div className="form-group">
      <label htmlFor="title">Title</label>
      <input
        type="text"
        id="title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        placeholder="What are you selling/buying?"
      />
    </div>

    <div className="form-group">
      <label htmlFor="description">Description</label>
      <textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        placeholder="Provide details about the item"
        rows={5}
      />
    </div>

    <div className="form-group">
      <label htmlFor="category">Category</label>
      <input
        type="text"
        id="category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
        placeholder="Enter item category"
      />
    </div>

    <div className="form-group">
      <label htmlFor="contactName">Your Name</label>
      <input
        type="text"
        id="contactName"
        name="contact_name"
        value={formData.contact_name}
        onChange={handleChange}
        required
        placeholder="Enter your name"
      />
    </div>

    <div className="form-group">
      <label htmlFor="contactNumber">Phone Number</label>
      <input
        type="tel"
        id="contactNumber"
        name="contact_number"
        value={formData.contact_number}
        onChange={handleChange}
        required
        placeholder="Enter your phone number"
      />
    </div>

    {formData.type === "sell" ? (
      <div className="form-group">
        <label htmlFor="price">Price (₹)</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          min="0"
          placeholder="0"
        />
      </div>
    ) : (
      <div className="form-group">
        <label htmlFor="budget">Budget (₹)</label>
        <input
          type="number"
          id="budget"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          required
          min="0"
          placeholder="0"
        />
      </div>
    )}
    
    {formData.type === "sell" && (
      <div className="form-group">
        <label htmlFor="images">Upload Image(s)</label>
        
        <div className="image-upload-container">
          <div className="image-preview-grid">
            {/* Existing Images */}
            {existingImages.map((imagePath, index) => (
              <div key={`existing-${index}`} className="image-preview-item">
                <img 
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${imagePath}`} 
                  alt={`Image ${index}`} 
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="remove-image-btn"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            
            {/* New Images */}
            {previews.map((url, index) => (
              <div key={`new-${index}`} className="image-preview-item">
                <img src={url} alt={`New Preview ${index}`} />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="remove-image-btn"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            
            <label htmlFor="image-upload" className="image-upload-label">
              <ImagePlus size={24} />
              <span>Add Images</span>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    )}

    <div className="form-actions">
      <button type="submit" className="button button-primary" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Listing"}
      </button>
      <Link href="/">
        <button type="button" className="button button-outline">
          Cancel
        </button>
      </Link>
    </div>
  </form>
</div>

)
}