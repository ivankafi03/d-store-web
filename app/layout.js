import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://dstore.sbs"),
  title: {
    default: "D Store | Akun Premium & Lisensi Digital Resmi Bergaransi",
    template: "%s | D Store"
  },
  description: "Pusat Akun Premium & Lisensi Digital Resmi Bergaransi. Canva Pro, YouTube Premium, ChatGPT Plus, Netflix, AI Tools, dan Software murah terpercaya.",
  keywords: [
    "D Store", "dstore", "jual akun premium", "canva pro murah",
    "youtube premium murah", "chatgpt plus murah", "netflix murah",
    "akun digital", "reseller akun digital", "ai tools murah"
  ],
  authors: [{ name: "D Store Official" }],
  creator: "D Store",
  publisher: "D Store",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://dstore.sbs/store",
    siteName: "D Store Official",
    title: "D Store | Akun Premium & Lisensi Digital Murah Bergaransi",
    description: "Katalog Akun Digital & Langganan Premium Resmi. Proses 1-5 menit, 100% bergaransi.",
    images: [
      {
        url: "/icon-192.png",
        width: 192,
        height: 192,
        alt: "D Store Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "D Store | Akun Premium & Lisensi Digital",
    description: "Pusat Akun Premium & Lisensi Digital Bergaransi.",
    images: ["/icon-192.png"],
  },
  verification: {
    google: "lml9mtD7Y_Yue-ku3083zJynhHvlSDOySxYmEk8eL_k",
  },
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
