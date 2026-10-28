import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Last Call",
  description: "Happy hours, bar nights, games and concerts in your city, by date.",
};

export const viewport: Viewport = {
  themeColor: "#172340",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${bricolage.variable} ${atkinson.variable}`}>
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="wordmark">
              Last Call
            </Link>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            Prototype. Specials and schedules change; check with the venue before you go.
          </div>
        </footer>
      </body>
    </html>
  );
}
