"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Listing } from "@/types/listing"
import { ArrowLeft, Package, ShoppingCart, Calendar, Phone, Trash2, AlertTriangle, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ListingDetail() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [showContact, setShowContact] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      const listingId = params.id as string // Ensure id is a string

      if (listingId) {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("id", listingId)
          .single()

        if (error) {
          console.error("Error fetching listing:", error)
          router.replace("/") 
        } else {
          const listingWithDateObject = {
            ...data,
            created_at: new Date(data.created_at)
          };
          setListing(listingWithDateObject);
        }
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [params.id, router])

  const handleDelete = async () => {
    if (!listing?.id) return

    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listing.id)

      if (error) throw error

      setShowDeleteModal(false)
      router.push("/")
    } catch (error) {
      console.error("Error deleting listing:", error)
      alert("Failed to delete listing. Please try again.")
    }
  }

  if (isLoading) return <p>Loading...</p>
  if (!listing) return <p>Listing not found.</p>

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const ordinal = getOrdinalSuffix(day);
    
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${day}${ordinal} ${month} ${year} at ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const handleImageClick = (imagePath: string) => {
    setEnlargedImage(imagePath);
  };
  
  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

  const getWhatsAppLink = () => {
    if (!listing) return '';
    const message = listing.type === "sell" 
      ? `Hi ${listing.contact_name}, I'm interested in buying "${listing.title}". Is it still available?` 
      : `Hi ${listing.contact_name}, I'm interested in "${listing.title}". Is it still available?`;
    return `https://wa.me/${listing.contact_number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };
  
  return (
    <>
      <div className="listing-detail">
        <Link href="/" className="inline-flex items-center text-primary-color mb-6 hover:underline">
          <ArrowLeft size={16} className="mr-2" />
          Back to listings
        </Link>

        <div className="listing-header">
          <h1>{listing.title}</h1>
          
          {/* Image gallery */}
          {listing.images && listing.images.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
              margin: '0 auto',
              maxWidth: '90%'
            }}>
              {listing.images.map((imagePath, index) => (
                <div 
                  key={index} 
                  style={{
                    position: 'relative',
                    width: '150px',
                    height: '150px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleImageClick(imagePath)}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${imagePath}`}
                    alt={`Listing image ${index + 1}`}
                    fill
                    style={{
                      objectFit: 'cover'
                    }}
                    sizes="150px"
                    quality={75}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-4">
            <span className={`listing-type ${listing.type}`}>
              {listing.type === "sell" ? (
                <>
                  <Package size={16} className="mr-1" /> For Sale
                </>
              ) : (
                <>
                  <ShoppingCart size={16} className="mr-1" /> Wanted
                </>
              )}
            </span>
            <span className="listing-price">₹{listing.price.toFixed(2)}</span>
            <span className="listing-date">
              <Calendar size={16} className="mr-1" />
              {formatDate(listing.created_at)}
            </span>
          </div>
        </div>

        <div className="listing-body">
          <div className="listing-description">
            <h2>Description</h2>
            <p>{listing.description}</p>
          </div>

          <div className="listing-contact">
            <h2>Contact Information</h2>
            <p>
              Posted by: <strong>{listing.contact_name}</strong>
            </p>

            {!showContact ? (
              <button onClick={() => setShowContact(true)} className="button button-primary w-full mt-4">
                Show Contact Details
              </button>
            ) : (
              <div className="contact-details">
                <p className="flex items-center gap-2">
                  <Phone size={18} />
                  {listing.contact_number}
                </p>
                
                <a 
                  href={getWhatsAppLink()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#25D366',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: 'var(--border-radius)',
                    fontWeight: '500',
                    marginTop: '16px'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="listing-actions">
          <button onClick={() => router.push("/")} className="button button-outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Listings
          </button>

          <button onClick={() => setShowDeleteModal(true)} className="button button-danger">
            <Trash2 size={16} className="mr-2" />
            Delete Listing
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Listing</h2>
            </div>
            <div className="modal-body">
              <div className="flex items-center gap-3 mb-4 text-danger-color">
                <AlertTriangle size={24} />
                <p className="text-danger-color font-semibold">This action cannot be undone</p>
              </div>
              <p>Are you sure you want to delete this listing?</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDeleteModal(false)} className="button button-outline">
                Cancel
              </button>
              <button onClick={handleDelete} className="button button-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 999,
              cursor: 'pointer'
            }}
            onClick={closeEnlargedImage}
          ></div>
          <div 
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              maxWidth: '90%',
              maxHeight: '90%',
              backgroundColor: 'black',
              padding: '10px',
              borderRadius: '8px'
            }}
          >
            <button 
              onClick={closeEnlargedImage}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1001,
                border: 'none'
              }}
            >
              <X size={20} color="white" />
            </button>
            <div style={{ position: 'relative', width: '80vw', height: '80vh' }}>
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${enlargedImage}`}
                alt="Enlarged listing image"
                fill
                className="object-contain"
                sizes="80vw"
                quality={90}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
