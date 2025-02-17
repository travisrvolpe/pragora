import { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

// This will proxy GraphQL requests to your FastAPI backend
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return httpProxyMiddleware(req, res, {
    target: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    pathRewrite: {
      '^/api/graphql': '/graphql',  // Rewrite path
    },
    changeOrigin: true,
  });
}
