import './globals.css';

export const metadata = {
  title: 'CSCSKB Online | AI Powered CSC Platform',
  description: 'AI powered CSC knowledge and service landing page for Streamlit and Vercel deployment.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
