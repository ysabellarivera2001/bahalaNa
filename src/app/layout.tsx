import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { ThemePaletteProvider } from "@/components/theme/theme-palette-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Data Operations Console",
  description:
    "Operator console for Kaseya to Strev/Revnue asset sync operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemePaletteProvider>{children}</ThemePaletteProvider>
      </body>
    </html>
  );
}
