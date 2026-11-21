import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'CSCSKB Online | AI Powered CSC Platform',
  description: 'AI powered CSC knowledge and service landing page for Streamlit and Vercel deployment.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9259849546872526"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        {children}
      </body>
    </html>
  );
}
