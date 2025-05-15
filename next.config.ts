// next.config.js
const supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [supabaseHostname],
  },
  eslint: {
    ignoreDuringBuilds: true, // 👈 This disables ESLint errors from breaking the build
  },
}

module.exports = nextConfig;
