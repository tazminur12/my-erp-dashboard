import "./globals.css";
import SessionProvider from "./providers/SessionProvider";
import { getSession } from "@/lib/auth";
import Script from "next/script";

export const metadata = {
  title: "Bin Rashid ERP - Complete Business Management Solution",
  description: "Bin Rashid Group ERP - বিস্তৃত ব্যবসায়িক সমাধানের শীর্ষস্থানীয় প্রদানকারী | Complete ERP solution for managing transactions, vendors, hajj & umrah, air ticketing, and more.",
  keywords: ["ERP", "Business Management", "Bin Rashid Group", "Enterprise Resource Planning", "বাংলাদেশ", "Bangladesh"],
  authors: [{ name: "Bin Rashid Group" }],
  creator: "Bin Rashid Group",
  publisher: "Bin Rashid Group",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bin-rashid-erp.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Bin Rashid ERP - Complete Business Management Solution",
    description: "Bin Rashid Group ERP - বিস্তৃত ব্যবসায়িক সমাধানের শীর্ষস্থানীয় প্রদানকারী | Complete ERP solution for managing transactions, vendors, hajj & umrah, air ticketing, and more.",
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://bin-rashid-erp.vercel.app',
    siteName: "Bin Rashid ERP",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bin-rashid-erp.vercel.app'}/All_Logo/BIN-RASHID-LOGO.png`,
        width: 1200,
        height: 630,
        alt: "Bin Rashid Group Logo",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bin Rashid ERP - Complete Business Management Solution",
    description: "Bin Rashid Group ERP - বিস্তৃত ব্যবসায়িক সমাধানের শীর্ষস্থানীয় প্রদানকারী",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'https://bin-rashid-erp.vercel.app'}/All_Logo/BIN-RASHID-LOGO.png`],
    creator: "@binrashidgroup",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/All_Logo/BIN-RASHID-LOGO.png", sizes: "32x32", type: "image/png" },
      { url: "/All_Logo/BIN-RASHID-LOGO.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/All_Logo/BIN-RASHID-LOGO.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/All_Logo/BIN-RASHID-LOGO.png",
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        {/* Font Preconnect */}
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        
        {/* Google Fonts */}
        <link
          href="https://fonts.cdnfonts.com/css/google-sans"
          rel="stylesheet"
        />
        {/* Kalpurush font is now self-hosted in /public/fonts/ and loaded via globals.css */}
        
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/All_Logo/BIN-RASHID-LOGO.png" />
        <link rel="shortcut icon" type="image/png" href="/All_Logo/BIN-RASHID-LOGO.png" />
        <link rel="apple-touch-icon" href="/All_Logo/BIN-RASHID-LOGO.png" />
      </head>
      <body className="antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
        
        {/* Tawk.to Live Chat Script */}
        <Script id="tawk-to-script" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/63626c7edaff0e1306d55022/1jceegqfr';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
