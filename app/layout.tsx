import PublicHeader from "@/components/layout/PublicHeader";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

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
      <body>
        {/* <PublicHeader />  */}
        
        <main className="">
          {children}
        </main>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}