/** @type {import('next').NextConfig} */
const nextConfig = {
  // From script 2 (enables the /app directory in Next.js 13+)
  experimental: {
    appDir: true,
  },

  // From both scripts
  reactStrictMode: true,

  // From script 2 (images config)
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },

  // Merge webpack config from both scripts
  webpack: (config) => {
    // 1) Add top-level await (from script 2)
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    // 2) Add GraphQL loader (from script 1)
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: '@graphql-tools/webpack-loader',
    });

    return config;
  },

  // Environment variables (from script 2 and the extra snippet)
  // If you need both NEXT_PUBLIC_API_URL and API_URL, you can include both:
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    // API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', // Only if you need it
  },

  // Optional redirects snippet (uncomment if you want to integrate it)
  /*
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      },
    ];
  },
  */

  // Optional TypeScript configuration from the snippet (uncomment if desired)
  /*
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  */
};

module.exports = nextConfig;
