/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  async headers() {
    const immutableHeaders = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];

    return [
      { source: "/:asset(alpnile-.*)", headers: immutableHeaders },
      { source: "/alpnile-pharaonic-ui-icons-optimized.webp", headers: immutableHeaders },
      { source: "/catalog/:asset*", headers: immutableHeaders },
      { source: "/chat/:asset*", headers: immutableHeaders },
      { source: "/fonts/:asset*", headers: immutableHeaders },
      { source: "/images/:asset*", headers: immutableHeaders },
      { source: "/trips/:asset*", headers: immutableHeaders },
      { source: "/vehicles/:asset*", headers: immutableHeaders },
    ];
  },
};

export default nextConfig;
