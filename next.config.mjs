/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push("canvas");
    }
    return config;
  },
};

export default nextConfig;
