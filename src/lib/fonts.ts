import { Inter, Nunito_Sans, Playfair_Display } from "next/font/google";

// Compartilhadas pelos dois layouts raiz (site e painel).
export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// So o painel: a fonte do painel de referencia do cliente.
export const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});
