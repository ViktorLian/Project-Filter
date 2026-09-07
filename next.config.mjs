/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/blog/geo-ai-sok',
        destination: '/blog/ai-crm-fremtiden',
        permanent: true,
      },
      {
        source: '/blog/google-maps-topp-3',
        destination: '/blog/google-min-bedrift-guide',
        permanent: true,
      },
      {
        source: '/blog/utdatert-nettside',
        destination: '/blog/nettside-til-leads',
        permanent: true,
      },
      {
        source: '/dashboard/review-gatekeeper',
        destination: '/dashboard/feedback',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
