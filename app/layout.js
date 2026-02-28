import "./globals.css";

export const metadata = {
  title: "MCGI Rescue - Butuan",
  description: "Emergency Alert System for the Elderly",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}