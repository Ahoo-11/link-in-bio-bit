import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AIChatWrapper from "@/components/AIChatWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LinkChain - Blockchain-Powered Link in Bio",
  description: "A beautiful, simple way for creators to receive blockchain payments",
  keywords: ["linktree", "blockchain", "stacks", "crypto", "tips", "payments"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
        <AIChatWrapper />
      </body>
    </html>
  );
}
