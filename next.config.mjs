/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:
              https://metrics.mercadolibre-content.com
              https://sdk.mercadopago.com;
              style-src 'self' 'unsafe-inline';
              connect-src 'self' https://firestore.googleapis.com;
            `.replace(/\s+/g, " "), // Remove espaços desnecessários
          },
        ],
      },
    ];
  },
};

export default nextConfig;
