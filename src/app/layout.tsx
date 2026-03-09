import type { Metadata } from "next";
import { JetBrains_Mono, Kreon, Lora } from "next/font/google";
import { ThemePaletteProvider } from "@/components/theme/theme-palette-provider";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
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
      <body className={`${lora.variable} ${kreon.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemePaletteProvider>{children}</ThemePaletteProvider>
      </body>
    </html>
  );
}
