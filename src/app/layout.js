import "./globals.css";

export const metadata = {
  title: "مستكشف إعلانات ميتا",
  description: "بحث مجاني بإعلانات فيسبوك وانستقرام عبر مكتبة إعلانات ميتا الرسمية",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
