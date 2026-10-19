import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { googleSignInEnabled } from "@/lib/auth-config";
import { site } from "@/lib/site";
import { StoreHydrator } from "@/lib/store/hydrator";
import { SignOutFeedback } from "@/components/auth/sign-out-feedback";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: Point-of-care ultrasound & imaging courses`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    type: "website",
    siteName: site.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1f3a",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <StoreHydrator googleSignIn={googleSignInEnabled} />
        {children}
        <SignOutFeedback />
      </body>
    </html>
  );
}
