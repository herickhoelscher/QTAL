import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Images/R2 em producao; os demais hosts cobrem thumbnails do
    // YouTube e as imagens de exemplo usadas no seed de desenvolvimento.
    remotePatterns: [
      { protocol: "https", hostname: "imagedelivery.net" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.cloudflarestorage.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
    formats: ["image/avif", "image/webp"],
    // 90 no heroi (ocupa a tela toda), 85 nos cards do feed e nas capas de
    // video; 75 so no que aparece pequeno. Em AVIF/WEBP a diferenca de peso
    // entre 75 e 85 e pequena, e era o 75 que deixava as fotos com aspecto
    // lavado nas grades largas.
    qualities: [75, 85, 90],
  },
};

export default nextConfig;
