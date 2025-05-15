// components/LoginButton.tsx
"use client";

import React from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import styles from "./loginbutton.module.css";

type Props = {
  isCollapsed: boolean;
  variant?: "light" | "dark";
};

export default function LoginButton({
  isCollapsed,
  variant = "dark",
}: Props) {
  const handleLogin = async () => {
    // Try to sign in via Google-no custom redirectTo
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Login failed:", error.message);
  };

  // (your existing Framer Motion code...)
  return (
    <motion.button
      className={[
        styles.pillButton,
        variant === "light" ? styles.lightVariant : styles.darkVariant,
        isCollapsed ? styles.collapsed : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleLogin}
      whileTap={{ scale: 0.95 }}
    >
      <motion.img
        src="https://img.icons8.com/?size=512&id=17949&format=png"
        alt="Google"
        width={isCollapsed ? 28 : 40}
        height={isCollapsed ? 28 : 40}
        className={styles.avatar}
      />
      <motion.div
        className={styles.userInfo}
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={{
          expanded: { opacity: 1, display: "flex", transition: { delay: 0.1 } },
          collapsed: {
            opacity: 0,
            transition: { duration: 0.1 },
            transitionEnd: { display: "none" },
          },
        }}
      >
        <span className={styles.name}>Login with Google</span>
      </motion.div>
    </motion.button>
  );
}
