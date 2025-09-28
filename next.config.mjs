/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://nimabalo.uz'
  },
  // Disable automatic deployments for development
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      // Add any development-specific config here
    }
  })
};

export default nextConfig;