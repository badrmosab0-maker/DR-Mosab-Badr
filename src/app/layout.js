import "./globals.css";

export const metadata = {
  title: "DR/ Mosab Badr",
  description: "منصة طبية ذكية: مساعد للمريض وبحث موثوق للمهنيين - كل إجابة من مصادر رسمية",
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
