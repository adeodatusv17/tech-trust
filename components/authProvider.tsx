"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: null | { email: string; id: string; name: string };
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  useEffect(() => {
    console.log("[AuthProvider] Fetching initial session...");
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("[AuthProvider] getSession error:", error);
          return;
        }
        console.log("[AuthProvider] getSession data:", data);
        const session = data.session;
        if (session?.user) {
          console.log(
            "[AuthProvider] Initial user:",
            session.user.email,
            session.user.id
          );
          
          // Check if the user has a name in the raw_user_meta_data
          const name = session.user.user_metadata?.full_name || session.user.email.split("@")[0];

          setUser({
            email: session.user.email,
            id: session.user.id,
            name: name,
          });
        } else {
          console.log("[AuthProvider] No initial session user");
        }
      })
      .catch((err) => {
        console.error("[AuthProvider] Unexpected getSession error:", err);
      });

    console.log("[AuthProvider] Subscribing to auth state changes...");
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[AuthProvider] onAuthStateChange:", event, session);
        if (session?.user) {
          console.log(
            "[AuthProvider] User logged in:",
            session.user.email,
            session.user.id
          );

          // Check if the user has a name in the raw_user_meta_data
          const name = session.user.user_metadata?.full_name || session.user.email.split("@")[0];

          setUser({
            email: session.user.email,
            id: session.user.id,
            name: name,
          });
        } else {
          console.log("[AuthProvider] User logged out or session expired");
          setUser(null);
        }
      }
    );

    return () => {
      console.log("[AuthProvider] Unsubscribing auth listener");
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
