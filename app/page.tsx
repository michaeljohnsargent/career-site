import TwinChat from "./components/TwinChat";
import { earlierRoles, principles, profile, roles } from "./content/career";

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="mark">{children}</span>;
}

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Michael Sargent home">
          <span className="wordmark-icon">
            MS<span>.</span>
          </span>
          <span className="wordmark-name">
            MICHAEL SARGENT
            <br />
            <small>SOFTWARE ENGINEER</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#journey">Journey</a>
          <a href="#work">Selected work</a>
          <a href="#digital-twin">Ask the twin</a>
        </nav>
        <a className="nav-cta" href={`mailto:${profile.email}`}>
          Let&rsquo;s talk <span aria-hidden="true">&#8599;</span>
        </a>
      </header>

      <section className="hero" id="home">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="availability-dot" /> OPEN TO SENIOR ENGINEERING ROLES{" "}
            <span className="eyebrow-location">&middot; CHARLESTON, SC</span>
          </div>
          <h1>
            Software that
            <br />
            does the <span className="serif-word">hard</span>
            <br />
            things <span className="outline-word">well.</span>
          </h1>
          <p className="hero-summary">
            26 years building dependable systems for defense, government, finance, and healthcare. I
            bring a steady hand to complicated problems&mdash;and see the work through to
            production.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#journey">
              Explore my experience <span aria-hidden="true">&#8595;</span>
            </a>
            <a className="text-link" href="/resume.pdf" target="_blank" rel="noreferrer">
              View r&eacute;sum&eacute; <span aria-hidden="true">&#8599;</span>
            </a>
          </div>
        </div>
        <aside className="hero-stamp" aria-label="26 years of engineering experience">
          <span className="stamp-orbit">SENIOR SOFTWARE ENGINEER &middot; SINCE 1999 &middot; </span>
          <span className="stamp-number">
            26<span>+</span>
          </span>
          <span className="stamp-caption">
            YEARS BUILDING
            <br />
            WHAT MATTERS
          </span>
        </aside>
        <div className="hero-bottom">
          <span>ENGINEERING WITH INTENTION</span>
          <span>32&deg;55&prime;N &nbsp; 80&deg;00&prime;W</span>
          <a href="#about">
            SCROLL TO EXPLORE <span aria-hidden="true">&#8595;</span>
          </a>
        </div>
      </section>

      <section className="proof-strip" aria-label="Career highlights">
        <div>
          <span>6&times;</span>
          <small>
            BAE Chairman&rsquo;s Award
            <br />
            for Innovation
          </small>
        </div>
        <i />
        <div>
          <span>
            6 <em>weeks</em>
          </span>
          <small>
            3-month compliance project
            <br />
            delivered in production
          </small>
        </div>
        <i />
        <div>
          <span>150</span>
          <small>
            Assessors supported
            <br />
            by real-time dashboards
          </small>
        </div>
        <i />
        <div>
          <span>
            26 <em>yrs</em>
          </span>
          <small>
            Building software
            <br />
            that earns its place
          </small>
        </div>
      </section>

      <section className="about section-shell" id="about">
        <div className="section-kicker">
          <Mark>01</Mark> A LITTLE ABOUT ME
        </div>
        <div className="about-layout">
          <div>
            <h2>
              Curiosity in the details.
              <br />
              <span className="serif-word">Ownership</span> in the outcome.
            </h2>
          </div>
          <div className="about-content">
            <p className="about-lead">
              I&rsquo;m Michael&mdash;a senior software engineer who likes turning tangled,
              high-stakes problems into systems people can count on.
            </p>
            <p>
              My career has taken me from Army access-control systems and federal financial software
              to healthcare compliance, consumer lending, and now production AI. The industries
              change. The expectation doesn&rsquo;t: understand the problem, do the work carefully,
              and deliver something that stands up in the real world.
            </p>
            <p>
              These days, I&rsquo;m bringing 26 years of engineering judgment to modern AI product
              development through <strong>Lamp Light Labs</strong>&mdash;while looking for the right
              full-time senior engineering team to build what&rsquo;s next.
            </p>
            <a
              className="inline-link"
              href={profile.projectUrl}
              target="_blank"
              rel="noreferrer"
            >
              See what I&rsquo;m building <span aria-hidden="true">&#8599;</span>
            </a>
          </div>
        </div>
      </section>

      <section className="beliefs">
        <div className="beliefs-head">
          <div className="section-kicker">
            <Mark>02</Mark> HOW I WORK
          </div>
          <p>
            The code matters.
            <br />
            The way you get there does, too.
          </p>
        </div>
        <div className="beliefs-list">
          {principles.map(([title, description], index) => (
            <article key={title}>
              <span className="belief-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="belief-arrow" aria-hidden="true">
                &#8599;
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="journey section-shell" id="journey">
        <div className="section-kicker">
          <Mark>03</Mark> THE CAREER JOURNEY
        </div>
        <div className="journey-heading">
          <h2>
            Built over time.
            <br />
            <span className="serif-word">Earned</span> in production.
          </h2>
          <p>
            More than two decades across the systems and industries where reliability is part of the
            job.
          </p>
        </div>
        <div className="timeline">
          {roles.map((item, index) => (
            <article className="timeline-entry" key={`${item.company}-${item.range}`}>
              <div className="timeline-meta">
                <span className="timeline-dot" />
                <span className="timeline-years">{item.years}</span>
                <span className="timeline-index">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="timeline-body">
                <h3>{item.title}</h3>
                <div className="timeline-company">{item.company}</div>
                <p>{item.detail}</p>
                <div className="tag-row">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
        <section className="earlier-experience" aria-labelledby="earlier-title">
          <div className="earlier-heading">
            <span className="timeline-years">1999 - 2018</span>
            <h3 id="earlier-title">Earlier experience</h3>
            <p>
              Defense, identity management, and field engineering roles that built the foundation
              for my career.
            </p>
          </div>
          <div className="earlier-list">
            {earlierRoles.map((item) => (
              <article key={`${item.company}-${item.range}`}>
                <span className="earlier-date">{item.years}</span>
                <div>
                  <h4>{item.title}</h4>
                  <div className="timeline-company">{item.company}</div>
                  <p>{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <div className="education-strip">
          <span>EDUCATION</span>
          <p>
            <strong>B.S. Computer Science, summa cum laude</strong> - Limestone College, Gaffney, SC
          </p>
        </div>
      </section>

      <section className="work" id="work">
        <div className="work-glow" aria-hidden="true" />
        <div className="work-inner">
          <div className="section-kicker">
            <Mark>04</Mark> SELECTED WORK
          </div>
          <div className="work-layout">
            <div>
              <div className="work-label">
                <span className="availability-dot" /> LIVE PROJECT &middot; LAMP LIGHT LABS
              </div>
              <h2>
                Intelligence for
                <br />
                the <span className="serif-word">next move.</span>
              </h2>
            </div>
            <div className="work-copy">
              <p>
                A job-search intelligence platform built to connect a r&eacute;sum&eacute; with the
                right opportunity. Production RAG pipeline, modern model integrations, and a full
                CI/CD path&mdash;all shaped around a real-world problem.
              </p>
              <div className="work-tags">
                <span>RAG</span>
                <span>ASP.NET Core</span>
                <span>Claude SDK</span>
                <span>Azure</span>
              </div>
              <a
                className="button button-light"
                href={profile.projectUrl}
                target="_blank"
                rel="noreferrer"
              >
                Visit the live project <span aria-hidden="true">&#8599;</span>
              </a>
              <span className="portfolio-note">More portfolio projects coming soon.</span>
            </div>
          </div>
          <div className="work-footer">
            <span>DESIGNED, BUILT &amp; DEPLOYED BY MICHAEL SARGENT</span>
            <span>01 / 01</span>
          </div>
        </div>
      </section>

      <TwinChat />

      <footer className="footer">
        <div className="section-kicker">
          <Mark>05</Mark> THE NEXT CHAPTER
        </div>
        <div className="footer-layout">
          <h2>
            Let&rsquo;s build
            <br />
            something <span className="serif-word">solid.</span>
          </h2>
          <div className="footer-contact">
            <p>
              Open to a full-time senior software engineering role. If you&rsquo;re building
              something that needs care, craft, and follow-through, I&rsquo;d like to hear about it.
            </p>
            <a className="button button-primary" href={`mailto:${profile.email}`}>
              {profile.email} <span aria-hidden="true">&#8599;</span>
            </a>
            <a className="phone-link" href="tel:+18433237418">
              {profile.phoneDisplay}
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <a className="wordmark" href="#home">
            <span className="wordmark-icon">
              MS<span>.</span>
            </span>
            <span className="wordmark-name">
              MICHAEL SARGENT
              <br />
              <small>SOFTWARE ENGINEER</small>
            </span>
          </a>
          <span>BASED IN CHARLESTON, SOUTH CAROLINA</span>
          <a href="#home">BACK TO TOP &#8593;</a>
          <span>&copy; 2026 MICHAEL SARGENT</span>
        </div>
      </footer>
    </main>
  );
}
