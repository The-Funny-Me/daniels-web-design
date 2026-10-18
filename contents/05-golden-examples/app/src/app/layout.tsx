import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/frank-ruhl-libre/400.css";
import "@fontsource/frank-ruhl-libre/500.css";
import "@fontsource/heebo/400.css";
import "@fontsource/heebo/500.css";
import "@fontsource-variable/inter";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { DesignProvider } from "@/components/patterns/design-provider";
import { DesignSwitcher } from "@/components/patterns/design-switcher";
import { AppToaster } from "@/components/patterns/toaster";
import { SkipLink } from "@/components/patterns/skip-link";

export const metadata: Metadata = {
  title: "Suite · golden examples",
  description: "Reference implementations of the /web-design system: landing, auth, chat and dashboard.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/** Runs before first paint so the stored (or ?pack=&theme=&dir=&motion=) choice never flashes the defaults. */
const preferenceScript = `(function(){try{var s={};try{s=JSON.parse(localStorage.getItem("ds-design")||"{}")}catch(e){}
var q=new URLSearchParams(location.search),r=document.documentElement;
var pack=q.get("pack")||s.pack,theme=q.get("theme")||s.theme,dir=q.get("dir")||s.dir,motion=q.get("motion")||s.motion;
if(pack)r.dataset.pack=pack;
if(theme==="light"||theme==="dark")r.dataset.theme=theme;
if(dir==="rtl"||dir==="ltr"){r.dir=dir;r.lang=dir==="rtl"?"he":"en"}
if(motion==="off")r.dataset.motion="reduced";
}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-pack="champagne-wine" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceScript }} />
      </head>
      <body className="font-sans text-ink antialiased">
        <DesignProvider>
          <SkipLink />
          {children}
          <DesignSwitcher />
          <AppToaster />
        </DesignProvider>
      </body>
    </html>
  );
}
