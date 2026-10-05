import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A antiga pagina "Assine" virou "Anuncie": links antigos continuam funcionando.
  async redirects() {
    return [
      { source: "/assine", destination: "/anuncie", permanent: true },
      { source: "/:lang(en|es)/assine", destination: "/:lang/anuncie", permanent: true },
    ];
  },
  images: {
    // Cloudflare Images/R2 em producao; os demais hosts cobrem thumbnails do
    // YouTube e as imagens de exemplo usadas no seed de desenvolvimento.
    remotePatterns: [
      { protocol: "https", hostname: "imagedelivery.net" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.cloudflarestorage.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      // Capas de reels: www.instagram.com/p/<id>/media redireciona para a CDN deles.
      { protocol: "https", hostname: "www.instagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
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
