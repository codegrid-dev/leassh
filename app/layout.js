import { Plus_Jakarta_Sans, Kaushan_Script } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

const script = Kaushan_Script({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-script",
});

// NEXT_PUBLIC_ variables are inlined at build time, so a localhost value left
// in the build environment would bake "http://localhost:3000" into og:image and
// every link preview would silently break. Only an https origin is trusted here.
const ENV_SITE = process.env.NEXT_PUBLIC_SITE_URL;
const SITE = ENV_SITE && ENV_SITE.startsWith("https://") ? ENV_SITE : "https://leashh.com";
const TITLE = "Leashh · Become a Pet Nanny and earn from your spare hours";
const DESCRIPTION =
  "Leashh puts you in front of pet owners on your own street. You set your rates, you pick who you work with.";

export const metadata = {
  // Without this, Next emits relative og:image URLs and WhatsApp, which needs
  // an absolute one, shows nothing and falls back to the favicon.
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Leashh",
    url: SITE,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
