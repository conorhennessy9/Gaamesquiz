import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter, Barlow } from "next/font/google"

/* Body font — clean and highly legible */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

/* Display / heading font — condensed, sporty, bold */
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-barlow",
})

export const metadata: Metadata = {
  title: "GAAmesquiz — Daily Rugby & GAA Quiz Games",
  description:
    "Your daily destination for rugby and GAA quiz games. Play TenaBall and Against the Clock — new questions every day.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable} bg-background`} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5376222361913675"
          crossOrigin="anonymous"
        ></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QKN98RSFJE"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-QKN98RSFJE');
  `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
