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

export const metadata = {
  title: "Leashh · Become a Pet Nanny and earn from your spare hours",
  description:
    "Leashh puts you in front of pet owners on your own street. You set your rates, you pick who you work with.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
