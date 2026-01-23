import "./globals.css";
import SessionProvider from "./providers/SessionProvider";

export const metadata = {
  title: "BIN Rashid Group ERP",
  description: "BIN Rashid Group ERP - বিস্তৃত ব্যবসায়িক সমাধানের শীর্ষস্থানীয় প্রদানকারী",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link rel="preconnect" href="https://fonts.maateen.me" />
        <link
          href="https://fonts.cdnfonts.com/css/google-sans"
          rel="stylesheet"
        />
        <link
          href="https://fonts.maateen.me/kalpurush/font.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
