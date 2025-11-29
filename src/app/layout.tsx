import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pirouette - Design Confidence for Non-Designers",
  description: "Data-driven landing page analysis tool that provides actionable design recommendations based on award-winning patterns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
        <head>
          {/* Plausible Analytics - Privacy-friendly, no cookies, GDPR compliant */}
          <Script
            async
            src="https://plausible.io/js/pa-_tjs5xvXV53Fm4u_z9vBw.js"
            strategy="afterInteractive"
          />
          <Script
            id="plausible-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
                plausible.init()
              `,
            }}
          />
        </head>
        <body className="font-body antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}

