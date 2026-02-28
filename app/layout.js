import "./globals.css";

export const metadata = {
  title: "MCGI Rescue - Butuan",
  description: "Emergency Alert System for the Elderly",
  icons: {
    icon: "/untv.png", // This points to public/untv.png
    apple: "/untv.png", // This ensures it looks good on iPhones too
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}