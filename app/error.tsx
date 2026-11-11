"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error.message, error.digest ?? "");
  }, [error]);

  return (
    <main className="status-page">
      <div className="status-inner">
        <div className="section-kicker">
          <span className="mark">!</span> SOMETHING WENT WRONG
        </div>
        <h1>
          That page didn&rsquo;t
          <br />
          <span className="serif-word">load.</span>
        </h1>
        <p>
          Sorry about that. Trying again usually sorts it. If it keeps happening I&rsquo;d like to
          know, since this is my own site and I built it.
        </p>
        <div className="status-actions">
          <button className="button button-primary" type="button" onClick={reset}>
            Try again
          </button>
          <Link className="text-link" href="/">
            Back to the start <span aria-hidden="true">&#8599;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
