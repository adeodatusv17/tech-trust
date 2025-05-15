// components/Navigation.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./authProvider";
import LoginButton from "./LoginButton"; // your existing motion button

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  const toggleMenu = () => {
    console.log("[Navigation] toggleMenu, was:", menuOpen);
    setMenuOpen((o) => !o);
  };

  const handleLogin = async () => {
    console.log("[Navigation] Starting Google login...");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      // no redirectTo override
    });
    console.log("[Navigation] signInWithOAuth returned data:", data);
    if (error) {
      console.error("[Navigation] Login error:", error);
    } else {
      console.log("[Navigation] Login initiated, check redirect");
    }
  };

  const handleLogout = async () => {
    console.log("[Navigation] Starting logout...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[Navigation] Logout error:", error);
    } else {
      console.log("[Navigation] Logout successful");
    }
  };

  console.log("[Navigation] Current user:", user);

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo">
            <ShoppingBag size={24} />
            Tech Trust
          </Link>

          <button
            className={`menu-toggle ${menuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
            <ul>
              <li>
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/my-listings" onClick={() => setMenuOpen(false)}>
                  My Listings
                </Link>
              </li>
            </ul>
          </nav>

          <div className="header-actions flex items-center space-x-4">
            <Link href="/create">
              <button className="button button-primary flex items-center">
                <ShoppingBag size={16} className="mr-2" />
                Post a Listing
              </button>
            </Link>
            


            {user ? (
              <>
                <span className="text-sm">
                

                  Welcome, {user.name || user.email.split("@")[0]}
                </span>
                <button
                  className="button button-secondary text-sm"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <LoginButton isCollapsed={false} variant="dark" onClick={handleLogin} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
