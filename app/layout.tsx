import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { Nav } from "@/components/ui/nav";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPTION =
  "Quirq builds infrastructure for agentic work. XO gives agents cloud computers; Space keeps projects, tools and agent activity together. Try XO free for 30 days.";

export const metadata: Metadata = {
  metadataBase: new URL("https://quirq.ai"),
  title: {
    default: "quirq · Infrastructure for agentic work",
    template: "%s · quirq",
  },
  description: DESCRIPTION,
  icons: {
    icon: "/assets/favicon.svg",
    apple: "/assets/quirq-mark.jpg",
  },
  openGraph: {
    title: "quirq · Infrastructure for agentic work",
    description: DESCRIPTION,
    url: "https://quirq.ai",
    type: "website",
    images: [{ url: "/assets/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "quirq · Infrastructure for agentic work",
    description: DESCRIPTION,
    images: ["/assets/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${geist.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        {/* Entrance animations start from opacity:0. Without JS those inline
            styles would never be cleared, so the page would render blank. */}
        {/* The agent disclosure and copy button need JS, so they are hidden
            rather than left as dead controls; the install command itself
            remains selectable and the page content remains fully readable. */}
        <noscript>
          <style>{`main *, nav, nav * { opacity: 1 !important; transform: none !important; filter: none !important; } .openin-toggle, .copy-command, .menu-toggle { display: none !important; }`}</style>
        </noscript>
      </head>
      <body>
        <MotionProvider>
          <Nav />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
