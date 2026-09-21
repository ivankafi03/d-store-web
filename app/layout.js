import "./globals.css";

export const metadata = {
  title: "D Store | Reseller Cloud Dashboard",
  description: "Dashboard Reseller Pribadi D Store terhubung Google Spreadsheet Cloud & Google Gemini AI.",
  manifest: "/manifest.json"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f4f4f0"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen selection:bg-yellow-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
