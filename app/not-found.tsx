import Link from "next/link";

export default function NotFound() {
  return (
    <main className="status-page">
      <div className="status-inner">
        <div className="section-kicker">
          <span className="mark">404</span> PAGE NOT FOUND
        </div>
        <h1>
          Nothing lives
          <br />
          <span className="serif-word">here.</span>
        </h1>
        <p>
          That address doesn&rsquo;t match anything on this site. The career history, selected work,
          and the digital twin are all on the main page.
        </p>
        <div className="status-actions">
          <Link className="button button-primary" href="/">
            Back to the start <span aria-hidden="true">&#8594;</span>
          </Link>
          <Link className="text-link" href="/#digital-twin">
            Ask the twin instead <span aria-hidden="true">&#8599;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
