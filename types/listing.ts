// In @/types/listing.ts
export interface Listing {
  id: string
  type: "sell" | "buy"
  title: string
  description: string
  category: string
  price: number
  budget: number
  images: string[]
  created_at: Date
  contact_name: string
  contact_number: string
  email: string
  user_id: string
}
