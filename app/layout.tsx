import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Michael Sargent — Senior Software Engineer",
  description:
    "Michael Sargent is a senior software engineer with 26 years of experience building dependable systems across defense, federal, financial, and healthcare industries.",
  openGraph: {
    title: "Michael Sargent — Senior Software Engineer",
    description: "26 years building software that earns its place in production.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
