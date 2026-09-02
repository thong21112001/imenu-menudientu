/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@imenu/ui", "@imenu/utils", "@imenu/types"],
  images: {
    domains: ["images.unsplash.com", "api.qrserver.com", "img.vietqr.io"],
  }
};

export default nextConfig;
