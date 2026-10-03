import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import { inter, nunito, playfair } from "@/lib/fonts";
import { THEME_STORAGE_KEY } from "@/components/admin/theme";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Painel",
  robots: { index: false, follow: false },
};

// Aplica o tema escuro salvo antes da primeira pintura, para o painel nao
// piscar branco ao carregar.
const themeScript = `try{if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

/**
 * Layout raiz do painel. O site publico vive em app/[lang] com o proprio
 * layout raiz; o painel fica fora dele porque e sempre em portugues.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${inter.variable} ${nunito.variable} admin-theme h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
