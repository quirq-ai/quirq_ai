import type { Metadata, Viewport } from "next";
import { Fira_Mono, Inter, JetBrains_Mono, Poppins } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { Nav } from "@/components/ui/nav";
import "./globals.css";

/* Geometric for the mark, grotesque for reading, mono for anything metered. */
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const fira = Fira_Mono({
  variable: "--font-fira",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPTION =
  "Tokens meter what your AI consumed. quirq meters what it delivered: verified against captured state, priced by the person who wanted it, costed all-in.";

export const metadata: Metadata = {
  metadataBase: new URL("https://quirq.ai"),
  title: {
    default: "quirq · work at light speed",
    template: "%s · quirq",
  },
  description: DESCRIPTION,
  icons: {
    icon: "/assets/favicon.svg",
    apple: "/assets/quirq-mark.jpg",
  },
  openGraph: {
    title: "quirq · work at light speed",
    description: DESCRIPTION,
    url: "https://quirq.ai",
    type: "website",
    images: [{ url: "/assets/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "quirq · work at light speed",
    description: DESCRIPTION,
    images: ["/assets/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${jetbrains.variable} ${fira.variable} antialiased`}
    >
      <head>
        {/* Entrance animations start from opacity:0. Without JS those inline
            styles would never be cleared, so the page would render blank. */}
        {/* The agent disclosure and copy button need JS, so they are hidden
            rather than left as dead controls; the install command itself
            remains selectable and the page content remains fully readable.
            .cta-bloom is hidden for a different reason: it is a hover-only
            spectrum glow that the opacity reset above would otherwise pin on,
            painting a rainbow blob behind every CTA on the page. */}
        <noscript>
          <style>{`main *, nav, nav * { opacity: 1 !important; transform: none !important; filter: none !important; } .openin-toggle, .copy-command, .menu-toggle, .cta-bloom { display: none !important; }`}</style>
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
