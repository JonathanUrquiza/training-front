import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Training Tracker - Tu Progreso Fitness",
  description: "Aplicación para seguimiento de entrenamiento con sistema de progresión",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased bg-[#0f0f14] text-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
