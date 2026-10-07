/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output bundle for Azure App Service Linux hosting
  output: "standalone",

  // Disable auto-generated agent guidelines from Next.js 16
  agentRules: false,

  // Security Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
