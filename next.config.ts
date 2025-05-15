// next.config.js
const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [supabaseHostname],
  },
  // ... other config
}

module.exports = nextConfig