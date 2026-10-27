/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@imenu/ui", "@imenu/utils", "@imenu/types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "img.vietqr.io" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
