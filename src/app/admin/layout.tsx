import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import { inter, playfair } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Painel",
  robots: { index: false, follow: false },
};

/**
 * Layout raiz do painel. O site publico vive em app/[lang] com o proprio
 * layout raiz; o painel fica fora dele porque e sempre em portugues.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
