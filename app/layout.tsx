import type { ReactNode } from "react"
import "./globals.css"
import { DM_Sans, Syne } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"

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
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var d=document.createElement('pre');
  d.id='__dbg';
  d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:rgba(0,0,0,.9);color:#0f0;font:9px/1.3 monospace;padding:4px 6px;pointer-events:none;white-space:pre-wrap;max-height:30vh;overflow:auto';
  document.addEventListener('DOMContentLoaded',function(){document.body.appendChild(d)});
  var lines=[];
  var prev='';
  function log(m){if(m===prev)return;prev=m;lines.push(m);if(lines.length>30)lines.shift();d.textContent=lines.join('\\n')}
  function snap(){
    var el=document.querySelector('[data-slot="expandable-tab-bar-dock"]');
    if(!el){log('NO DOCK');return}
    var r=el.getBoundingClientRect();
    var vis=r.bottom>0&&r.top<window.innerHeight;
    log((vis?'VIS':'HIDDEN')+' top:'+r.top.toFixed(0)+' bot:'+r.bottom.toFixed(0)+' h:'+r.height.toFixed(0)+' scrollY:'+Math.round(window.scrollY)+' innerH:'+window.innerHeight+' docH:'+document.documentElement.scrollHeight);
  }
  setInterval(snap,300);
})();
`}} />
      </head>
      <body className={`${dmSans.variable} ${syne.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="chillwave" enableSystem disableTransitionOnChange={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
