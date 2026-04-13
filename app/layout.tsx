import type React from "react"
import type { Metadata } from "next"
import { Tinos as Times } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const times = Times({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-times",
})

export const metadata: Metadata = {
  title: "Newsline Radio - Live Broadcasting",
  description: "Professional news and radio broadcasting 24/7",
  generator: "v0.dev",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://radio.newsline.co.ke'),
  openGraph: {
    title: "Newsline Radio - Live Broadcasting",
    description: "Professional news and radio broadcasting 24/7",
    url: '/',
    siteName: 'Newsline Radio',
    images: [
      {
        url: '/newsline-logo.png',
        width: 1200,
        height: 630,
        alt: 'Newsline Radio Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Newsline Radio - Live Broadcasting",
    description: "Professional news and radio broadcasting 24/7",
    images: ['/newsline-logo.png'],
    creator: '@newslinemediatv',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
html {
  font-family: ${times.style.fontFamily};
  --font-times: ${times.variable};
}
          `
        }} />
      </head>
      <body className={times.className} suppressHydrationWarning>
        {children}
        <Toaster position="top-right" expand={true} richColors />
      </body>
    </html>
  )
}
