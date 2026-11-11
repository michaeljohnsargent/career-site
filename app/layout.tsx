import type { Metadata } from "next";

import { profile } from "./content/career";
import "./globals.css";

/**
 * TODO before deploying: replace this with the real domain. It is what makes
 * Open Graph image URLs and the canonical link absolute, so a shared link
 * renders a preview card instead of a bare text row. Without it Next falls back
 * to localhost, which is harmless locally and wrong in production.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

const title = `${profile.shortName} — ${profile.title}`;
const description = `${profile.shortName} is a senior software engineer with ${profile.years} years of experience building dependable systems across defense, federal, financial, and healthcare industries.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description: `${profile.years} years building software that earns its place in production.`,
    type: "website",
    url: "/",
    siteName: profile.shortName,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: `${profile.years} years building software that earns its place in production.`,
  },
  robots: { index: true, follow: true },
};

/**
 * Structured data describing the one person this site is about. Search engines
 * use it to connect the page to a named professional rather than treating it
 * as an anonymous document.
 */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  email: `mailto:${profile.email}`,
  telephone: profile.phone,
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Charleston",
    addressRegion: "SC",
    addressCountry: "US",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Limestone College",
  },
  knowsAbout: [
    "C#",
    ".NET",
    "ASP.NET Core",
    "Microsoft Azure",
    "SQL Server",
    "Systems integration",
    "CI/CD",
    "Retrieval-augmented generation",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          // Content is a local constant, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}
