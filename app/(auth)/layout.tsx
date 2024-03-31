import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import '../globals.css'
import { dark } from "@clerk/themes";
import React from "react";
import type { Metadata } from "next";


export const metadata: Metadata = {
    title: "BanyanBonds: Where Words Weave Connections",
    description: "Join BanyanBonds, a unique community dedicated to the power of words. Dive into discussions, share your thoughts, and connect through poetry and stories in a positive, ad-free space. Unite under the canopy of language and grow with us",
  };

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider
            /* appearance={{ baseTheme: dark}} */
        >
            <html lang="en">
                <body className={`${inter.className} bg-white`}>
                    <div className="w-full flex justify-center items-center min-h-screen">
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    );
    }