"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./authProvider";
import LoginButton from "./LoginButton";
import { Suspense } from "react";

// Create a client-only auth section component
const AuthSection = () => {
  const { user } = useAuth();
  
  const handleLogout = async () => {
    console.log("[Navigation] Starting logout...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[Navigation] Logout error:", error);
    } else {
      console.log("[Navigation] Logout successful");
    }
  };
  
  const handleLogin = async () => {
    console.log("[Navigation] Starting Google login...");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      console.error("[Navigation] Login error:", error);
    }
  };
  
  return (
    <>
      {user ? (
        <div className="tt-user-section">
          <span className="tt-welcome-text">
            Welcome, {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="tt-signout-btn"
          >
            Sign out
          </button>
        </div>
      ) : (
        <LoginButton />

      )}
    </>
  );
};

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="tt-header">
      <div className="tt-header-container">
        <Link href="/" className="tt-logo">
          <ShoppingBag size={24} />
          <span>Tech Trust</span>
        </Link>
        
        <button 
          className={`tt-menu-toggle ${isMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`tt-nav-section ${isMenuOpen ? 'open' : ''}`}>
          <ul className="tt-nav-links">
            <li className="tt-nav-item">
              <Link href="/" className="tt-nav-link">Home</Link>
            </li>
            <li className="tt-nav-item">
              <Link href="/my-listings" className="tt-nav-link">My Listings</Link>
            </li>
          </ul>
          
          <div className="tt-nav-actions">
            <Link 
              href="/create" 
              className="tt-post-btn"
            >
              Post a Listing
            </Link>
            
            <Suspense fallback={<div className="h-10 w-36 bg-slate-800 animate-pulse rounded-md"></div>}>
              <AuthSection />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
