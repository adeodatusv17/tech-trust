const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!rawUrl) {
  throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_URL is not set.");
}

const supabaseHostname = new URL(rawUrl).hostname;

const nextConfig = {
  images: {
    domains: [supabaseHostname],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
