import "./globals.css";
import SessionProvider from "./providers/SessionProvider";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "BIN Rashid Group ERP",
  description: "BIN Rashid Group ERP - বিস্তৃত ব্যবসায়িক সমাধানের শীর্ষস্থানীয় প্রদানকারী",
};

export default async function RootLayout({ children }) {
  const session = await getSession();
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
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
