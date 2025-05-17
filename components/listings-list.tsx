"use client"

import { useState } from "react"
import Link from "next/link"
import { useListings } from "./listings-provider"
import { ShoppingCart, Package, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 5

export default function ListingsList() {
  const { listings } = useListings()
  const [currentPage, setCurrentPage] = useState(1)
  const [listingType, setListingType] = useState("sell")
  
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentListings = listings
    .filter(listing => listing.type === listingType)
    .slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(listings.filter(listing => listing.type === listingType).length / ITEMS_PER_PAGE)

  const toggleListingType = () => {
    setListingType(prevType => prevType === "sell" ? "buy" : "sell")
    setCurrentPage(1)
  }

  if (listings.length === 0) {
    return (
      <div className="no-listings" style={{
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <p style={{ marginBottom: '20px', fontSize: '18px', color: '#666' }}>No listings found. Be the first to post one!</p>
        <Link href="/create">
          <button className="button button-primary" style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s'
          }}>Post a Listing</button>
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{
        display: 'inline-flex',
        backgroundColor: '#f0f0f0',
        borderRadius: '20px',
        padding: '4px',
        cursor: 'pointer',
        marginBottom: '20px'
      }} onClick={toggleListingType}>
        <div style={{
          padding: '8px 16px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          transition: 'background-color 0.3s ease',
          backgroundColor: listingType === 'buy' ? '#3498db' : 'transparent',
          color: listingType === 'buy' ? 'white' : '#333',
        }}>
          <ShoppingCart size={18} style={{ marginRight: '8px' }} />
          BUY
        </div>
        <div style={{
          padding: '8px 16px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          transition: 'background-color 0.3s ease',
          backgroundColor: listingType === 'sell' ? '#2ecc71' : 'transparent',
          color: listingType === 'sell' ? 'white' : '#333',
        }}>
          <Package size={18} style={{ marginRight: '8px' }} />
          SELL
        </div>
      </div>

      <div className="listings-list" style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'flex-start',
        width: '100%'
      }}>
        {currentListings.map((listing) => (
          <Link href={`/listings/${listing.id}`} key={listing.id} style={{
            flex: '0 0 calc(20% - 16px)',
            maxWidth: 'calc(20% - 16px)',
            minWidth: '200px',
            marginBottom: '16px',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <div className="listing-card" style={{ 
              position: 'relative',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '220px',
              maxHeight: '300px'
            }}>
              <span className={`listing-type ${listing.type}`} style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: listing.type === 'sell' ? '#2ecc71' : '#3498db',
                color: 'white',
                zIndex: 10,
                maxWidth: '90px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center'
              }}>
                {listing.type === "sell" ? (
                  <>
                    <Package size={14} style={{ marginRight: '4px' }} /> For Sale
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} style={{ marginRight: '4px' }} /> Wanted
                  </>
                )}
              </span>
          
              <div className="listing-card-content" style={{
                padding: '16px',
                paddingTop: '36px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  lineHeight: '1.3',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>{listing.title}</h3>
                
                <p className="listing-description" style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '12px',
                  flexGrow: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {listing.description.length > 100 ? `${listing.description.substring(0, 100)}...` : listing.description}
                </p>
                
                <div className="listing-meta" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto'
                }}>
                  <span className="listing-category" style={{
                    fontSize: '12px',
                    maxWidth: '40%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color:'white'
                  }}>{listing.category}</span>
                  
                  <span className="listing-price" style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    maxWidth: '60%',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {listing.type === "sell" ? `Ask` : `Budget`}: ₹{listing.type === "sell" ? listing.price.toFixed(2) : listing.budget.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
          
        ))}
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: '20px',
        marginBottom: '40px'
      }}>
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ 
            padding: '8px 12px', 
            marginRight: '10px', 
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            backgroundColor: currentPage === 1 ? '#f0f0f0' : 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentPage === 1 ? 0.5 : 1
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <span style={{ margin: '0 10px', fontSize: '14px' }}>Page {currentPage} of {totalPages || 1}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ 
            padding: '8px 12px', 
            marginLeft: '10px', 
            cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
            backgroundColor: (currentPage === totalPages || totalPages === 0) ? '#f0f0f0' : 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
