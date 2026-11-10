import TwinChat from "./components/TwinChat";

const roles = [
  {
    years: "OCT 2025 — NOW",
    role: "Founder & Engineer",
    company: "Lamp Light Labs",
    detail: "Building live AI products with RAG, Claude, and Semantic Kernel. Personally owning the architecture, cloud deployment, and operational decisions behind a production job-search intelligence platform.",
    tags: ["AI / RAG", "C# / .NET", "Azure", "React / TypeScript"],
    index: "01",
  },
  {
    years: "FEB 2023 — FEB 2024",
    role: "Senior Software Engineer",
    company: "First Franklin Financial · Application Engineering",
    detail: "Built a Git-based source control and PR review workflow for custom JavaScript inside the DecisionLender SaaS platform, replaced a manual loan-export process with Azure Functions, Key Vault, and Storage Tables, and introduced API versioning and a Windows Service.",
    tags: ["Azure Functions", "Git / CI/CD", "SQL", "Financial services"],
    index: "02",
  },
  {
    years: "FEB 2024 — MAR 2026",
    role: "Senior Software Engineer",
    company: "First Franklin Financial · Reporting Team",
    detail: "Reassigned to lead Git and development-standards adoption for the Power BI reporting team. Refactored 30+ stored procedures from cursor-based to set-based logic and used Datadog to find bottlenecks, cutting runtime 60-80 percent—one job dropped from 6+ hours to under 30 minutes. Also built SQL/Python checks for a SQL Server-to-Snowflake migration.",
    tags: ["SQL Server", "Power BI", "Snowflake", "Performance tuning"],
    index: "03",
  },
  {
    years: "MAY 2022 — FEB 2023",
    role: "Senior Software Developer",
    company: "Veterans Health Administration · Booz Allen",
    detail: "Built C# Dynamics 365 integrations on a 30+ person Agile program modernizing veteran travel reimbursement claims.",
    tags: ["C#", "Dynamics 365", "TDD", "Federal"],
    index: "04",
  },
  {
    years: "OCT 2020 — MAY 2022",
    role: "Senior Software Developer",
    company: "BlueCross BlueShield of South Carolina",
    detail: "Shipped a production compliance evidence platform in six weeks against an original three-month, three-developer estimate. Built Splunk dashboards for 150 assessors.",
    tags: ["Python", "SQLAlchemy", "Splunk", "Healthcare"],
    index: "05",
  },
  {
    years: "NOV 2018 - OCT 2020",
    role: "Senior Software Engineer",
    company: "U.S. Department of State - Global Financial Services",
    detail: "Supported payroll, accounting, and currency-exchange systems serving U.S. posts in 134+ countries and 180 currencies. Automated batch and OS-level work, investigated production incidents, and contributed to web development and process improvements.",
    tags: ["PowerShell", "ASP.NET MVC", "Entity Framework", "Federal"],
    index: "06",
  },
];

const principles = [
  ["Own the outcome", "I take work all the way from a tough problem to a dependable production release."],
  ["Make it make sense", "Clear architecture, usable documentation, and honest communication are part of the engineering."],
  ["Improve the system", "I look for the process behind the bug—and the small change that keeps it from coming back."],
];

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="mark">{children}</span>;
}

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Michael Sargent home"><span className="wordmark-icon">MS<span>.</span></span><span className="wordmark-name">MICHAEL SARGENT<br /><small>SOFTWARE ENGINEER</small></span></a>
        <nav aria-label="Main navigation">
          <a href="#about">About</a><a href="#journey">Journey</a><a href="#work">Selected work</a><a href="#digital-twin">Ask the twin</a>
        </nav>
        <a className="nav-cta" href="mailto:michaeljohnsargent@gmail.com">Let’s talk <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="home">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow"><span className="availability-dot" /> OPEN TO SENIOR ENGINEERING ROLES <span className="eyebrow-location">· CHARLESTON, SC</span></div>
          <h1>Software that<br />does the <span className="serif-word">hard</span><br />things <span className="outline-word">well.</span></h1>
          <p className="hero-summary">26 years building dependable systems for defense, government, finance, and healthcare. I bring a steady hand to complicated problems—and see the work through to production.</p>
          <div className="hero-actions"><a className="button button-primary" href="#journey">Explore my experience <span aria-hidden="true">↓</span></a><a className="text-link" href="/resume.pdf" target="_blank" rel="noreferrer">View résumé <span aria-hidden="true">↗</span></a></div>
        </div>
        <aside className="hero-stamp" aria-label="26 years of engineering experience"><span className="stamp-orbit">SENIOR SOFTWARE ENGINEER · SINCE 1999 · </span><span className="stamp-number">26<span>+</span></span><span className="stamp-caption">YEARS BUILDING<br />WHAT MATTERS</span></aside>
        <div className="hero-bottom"><span>ENGINEERING WITH INTENTION</span><span>32°55′N &nbsp; 80°00′W</span><a href="#about">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></a></div>
      </section>

      <section className="proof-strip" aria-label="Career highlights"><div><span>6×</span><small>BAE Chairman’s Award<br />for Innovation</small></div><i /><div><span>6 <em>weeks</em></span><small>3-month compliance project<br />delivered in production</small></div><i /><div><span>150</span><small>Assessors supported<br />by real-time dashboards</small></div><i /><div><span>26 <em>yrs</em></span><small>Building software<br />that earns its place</small></div></section>

      <section className="about section-shell" id="about">
        <div className="section-kicker"><Mark>01</Mark> A LITTLE ABOUT ME</div>
        <div className="about-layout"><div><h2>Curiosity in the details.<br /><span className="serif-word">Ownership</span> in the outcome.</h2></div><div className="about-content"><p className="about-lead">I’m Michael—a senior software engineer who likes turning tangled, high-stakes problems into systems people can count on.</p><p>My career has taken me from Army access-control systems and federal financial software to healthcare compliance, consumer lending, and now production AI. The industries change. The expectation doesn’t: understand the problem, do the work carefully, and deliver something that stands up in the real world.</p><p>These days, I’m bringing 26 years of engineering judgment to modern AI product development through <strong>Lamp Light Labs</strong>—while looking for the right full-time senior engineering team to build what’s next.</p><a className="inline-link" href="https://match.lamplightlabs.com" target="_blank" rel="noreferrer">See what I’m building <span aria-hidden="true">↗</span></a></div></div>
      </section>

      <section className="beliefs"><div className="beliefs-head"><div className="section-kicker"><Mark>02</Mark> HOW I WORK</div><p>The code matters.<br />The way you get there does, too.</p></div><div className="beliefs-list">{principles.map(([title, desc], i) => <article key={title}><span className="belief-number">0{i + 1}</span><h3>{title}</h3><p>{desc}</p><span className="belief-arrow" aria-hidden="true">↗</span></article>)}</div></section>

      <section className="journey section-shell" id="journey">
        <div className="section-kicker"><Mark>03</Mark> THE CAREER JOURNEY</div>
        <div className="journey-heading"><h2>Built over time.<br /><span className="serif-word">Earned</span> in production.</h2><p>More than two decades across the systems and industries where reliability is part of the job.</p></div>
        <div className="timeline">{roles.map((item) => <article className="timeline-entry" key={item.index}><div className="timeline-meta"><span className="timeline-dot" /><span className="timeline-years">{item.years}</span><span className="timeline-index">{item.index}</span></div><div className="timeline-body"><h3>{item.role}</h3><div className="timeline-company">{item.company}</div><p>{item.detail}</p><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></article>)}</div>
        <section className="earlier-experience" aria-labelledby="earlier-title">
          <div className="earlier-heading"><span className="timeline-years">1999 - 2018</span><h3 id="earlier-title">Earlier experience</h3><p>Defense, identity management, and field engineering roles that built the foundation for my career.</p></div>
          <div className="earlier-list">
            <article><span className="earlier-date">JUN 2015 - NOV 2018</span><div><h4>Field Support Lead / Software Engineer</h4><div className="timeline-company">Iberon LLC - Army AIE II+ Contract</div><p>Developed C# and Ruby on Rails for Army automated gate and access-control systems. Provided Tier III field support and evaluated SDKs for installations nationwide.</p></div></article>
            <article><span className="earlier-date">NOV 2014 - JUN 2015</span><div><h4>Lead Software Engineer</h4><div className="timeline-company">Technology Industries Inc.</div><p>Led solutions for FAA and Pentagon identity and access-management projects. Built RESTful .NET services, documented APIs, and set up Azure environments.</p></div></article>
            <article><span className="earlier-date">MAY 1999 - NOV 2014</span><div><h4>Senior Software Engineer / Acting Supervisor</h4><div className="timeline-company">BAE Systems - Charleston, SC</div><p>Spent 15 years progressing from developer to acting supervisor of a five-person team building Army installation-entry systems, C4I applications, portals, reports, and integrations. Received the BAE Systems Chairman's Award for Innovation six times.</p></div></article>
          </div>
        </section>
        <div className="education-strip"><span>EDUCATION</span><p><strong>B.S. Computer Science, summa cum laude</strong> - Limestone College, Gaffney, SC</p></div>
      </section>

      <section className="work" id="work"><div className="work-glow" aria-hidden="true" /><div className="work-inner"><div className="section-kicker"><Mark>04</Mark> SELECTED WORK</div><div className="work-layout"><div><div className="work-label"><span className="availability-dot" /> LIVE PROJECT · LAMP LIGHT LABS</div><h2>Intelligence for<br />the <span className="serif-word">next move.</span></h2></div><div className="work-copy"><p>A job-search intelligence platform built to connect a résumé with the right opportunity. Production RAG pipeline, modern model integrations, and a full CI/CD path—all shaped around a real-world problem.</p><div className="work-tags"><span>RAG</span><span>ASP.NET Core</span><span>Claude SDK</span><span>Azure</span></div><a className="button button-light" href="https://match.lamplightlabs.com" target="_blank" rel="noreferrer">Visit the live project <span aria-hidden="true">↗</span></a><span className="portfolio-note">More portfolio projects coming soon.</span></div></div><div className="work-footer"><span>DESIGNED, BUILT & DEPLOYED BY MICHAEL SARGENT</span><span>01 / 01</span></div></div></section>

      <TwinChat />

      <footer className="footer"><div className="section-kicker"><Mark>05</Mark> THE NEXT CHAPTER</div><div className="footer-layout"><h2>Let’s build<br />something <span className="serif-word">solid.</span></h2><div className="footer-contact"><p>Open to a full-time senior software engineering role. If you’re building something that needs care, craft, and follow-through, I’d like to hear about it.</p><a className="button button-primary" href="mailto:michaeljohnsargent@gmail.com">michaeljohnsargent@gmail.com <span aria-hidden="true">↗</span></a><a className="phone-link" href="tel:+18433237418">+1 843 323 7418</a></div></div><div className="footer-bottom"><a className="wordmark" href="#home"><span className="wordmark-icon">MS<span>.</span></span><span className="wordmark-name">MICHAEL SARGENT<br /><small>SOFTWARE ENGINEER</small></span></a><span>BASED IN CHARLESTON, SOUTH CAROLINA</span><a href="#home">BACK TO TOP ↑</a><span>© 2026 MICHAEL SARGENT</span></div></footer>
    </main>
  );
}
