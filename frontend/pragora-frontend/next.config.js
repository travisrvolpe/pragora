/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
    },
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/**',
            },
        ],
    },

    webpack: (config) => {
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
        }
        return config
    },
    // Add proper environment variable handling - DO I NEED TO ADD ANYTHING HERE
        env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    },
}

//DOES THIS NEED TO BE INTRGATED?
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
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  }
}

module.exports = nextConfig*/