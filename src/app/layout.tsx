import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uppy",
  description: "File hosting/sharing web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <title>{metadata.title}</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
