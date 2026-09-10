import type { Metadata } from "next";
import { Sora, Work_Sans } from "next/font/google";
import "./globals.css";

// I due unici typeface previsti da brand-guidelines.md.
const sora = Sora({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-heading",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loresync",
  description: "Tieni traccia di manga, manhwa e manhua letti online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${sora.variable} ${workSans.variable}`}>
      <body className="bg-secondary font-sans text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
