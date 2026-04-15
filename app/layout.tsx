import type { ReactNode } from "react"
import "./globals.css"
import { DM_Sans, Syne } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { StudioShellProvider } from "@/components/studio-shell-context"
import { Toaster } from "@/components/toaster"
import { Analytics } from "@vercel/analytics/next"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700", "800"],
})

export const metadata = {
  title: "Pride Guide",
  description: "Celebrate diversity, learn with pride!",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={`${dmSans.variable} ${syne.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="chillwave" enableSystem disableTransitionOnChange={false}>
          <StudioShellProvider>
            {children}
            <Toaster />
            <Analytics />
          </StudioShellProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
