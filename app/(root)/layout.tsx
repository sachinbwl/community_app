import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Topbar from "@/components/shared/Topbar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import Bottombar from "@/components/shared/Bottombar";
import React from "react";
import { dark } from "@clerk/themes";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BanyanBonds: Where Words Weave Connections",
  description: "Join BanyanBonds, a unique community dedicated to the power of words. Dive into discussions, share your thoughts, and connect through poetry and stories in a positive, ad-free space. Unite under the canopy of language and grow with us",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark, }}>
      <html lang="en">
        <body className={inter.className}>
          <Topbar />
          <main className="flex flex-row">
            <LeftSidebar />

            <section className="main-container">
              <div className="w-full max-w-4xl">
                {children}
              </div>
            </section>
            {/* @ts-ignore */}
            <RightSidebar />
          </main>
          <Bottombar />
        </body>
      </html>
    </ClerkProvider>
  );
}
