import type { NextConfig } from "next";

/**
 * Conservative headers for a site with no authentication and no user accounts.
 * A full Content-Security-Policy is deliberately not set here: Next injects
 * inline bootstrap scripts, so a correct CSP needs nonce plumbing, and a
 * half-correct one tends to get switched off the first time it breaks
 * something. Everything below is safe to set without that work.
 */
const securityHeaders = [
  // Nobody should be framing this page inside theirs.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // None of these features are used by this site.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
