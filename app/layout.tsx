import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { JetBrains_Mono, Manrope } from "next/font/google";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HackSphere",
  description: "HackSphere - Hackathon Management System by TechTitans",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${jetbrainsMono.variable} antialiased`}>
        <main>
          {children}
        </main>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
