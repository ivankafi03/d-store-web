import "./globals.css";

export const metadata = {
  title: "D Store | Akun Premium & Lisensi Digital",
  description: "Pusat Akun Premium & Lisensi Digital Bergaransi. Streaming, AI Tools, Software, dan lebih banyak lagi.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-32.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FDFBF7"
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
