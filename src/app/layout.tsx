import type { Metadata } from "next";
import { JetBrains_Mono, Kreon, Ubuntu_Condensed } from "next/font/google";
import { ThemePaletteProvider } from "@/components/theme/theme-palette-provider";
import "./globals.css";

const ubuntuCondensed = Ubuntu_Condensed({
  variable: "--font-ubuntu-condensed",
  subsets: ["latin"],
  weight: "400",
});

const kreon = Kreon({
  variable: "--font-kreon",
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
      <body className={`${ubuntuCondensed.variable} ${kreon.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemePaletteProvider>{children}</ThemePaletteProvider>
      </body>
    </html>
  );
}
