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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${times.style.fontFamily};
  --font-times: ${times.variable};
}
        `}</style>
      </head>
      <body className={times.className}>
        {children}
        <Toaster position="top-right" expand={true} richColors />
      </body>
    </html>
  )
}
