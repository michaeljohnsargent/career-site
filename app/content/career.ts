/**
 * Single source of truth for career facts.
 *
 * Both the timeline on the page and the CAREER section of the digital twin's
 * system prompt are built from this file. Before it existed the same facts were
 * hardcoded in two places and drifted apart twice in one day, most visibly when
 * the First Franklin role was split into two phases on the page but left as a
 * single role in the prompt.
 *
 * Each role carries two descriptions on purpose:
 *   - `detail`  short, page-facing copy, written to be read
 *   - `facts`   denser factual summary, written to ground the model
 *
 * The structural facts (dates, titles, employers, order) are shared and cannot
 * drift. The prose stays purpose-specific, because marketing copy and model
 * context are not the same job. Edit a date or an employer once, here, and both
 * the page and the twin follow.
 */

export type Role = {
  /** Display label for the timeline, e.g. "FEB 2023 - FEB 2024". */
  years: string;
  /** Machine-readable range for the prompt, e.g. "Feb 2023-Feb 2024". */
  range: string;
  title: string;
  /** Employer as shown on the page, may include a team suffix. */
  company: string;
  /** Employer as stated to the model, including the staffing intermediary. */
  employer: string;
  detail: string;
  facts: string;
  tags: string[];
};

export type EarlierRole = {
  years: string;
  range: string;
  title: string;
  company: string;
  detail: string;
  facts: string;
};

export const profile = {
  name: "Michael J. Sargent",
  shortName: "Michael Sargent",
  title: "Senior Software Engineer",
  location: "Hanahan / Charleston, South Carolina",
  shortLocation: "Charleston, SC",
  email: "michaeljohnsargent@gmail.com",
  phone: "+1 843-323-7418",
  phoneDisplay: "+1 843 323 7418",
  projectUrl: "https://match.lamplightlabs.com",
  years: 26,
  availability: "Open to full-time senior software engineering roles, available immediately.",
  summary:
    "Senior software engineer with 26 years of production experience across defense, federal, financial, and healthcare sectors. Strengths include C#, .NET, ASP.NET Core, Azure, SQL, systems integration, CI/CD, and practical engineering ownership.",
  education: "B.S. Computer Science, summa cum laude, Limestone College, Gaffney, SC",
} as const;

export const roles: Role[] = [
  {
    years: "OCT 2025 - NOW",
    range: "Oct 2025-present",
    title: "Founder & Engineer",
    company: "Lamp Light Labs",
    employer: "Lamp Light Labs",
    detail:
      "Building live AI products with RAG, Claude, and Semantic Kernel. Personally owning the architecture, cloud deployment, and operational decisions behind a production job-search intelligence platform.",
    facts:
      "Designed, built, and deployed a job-search intelligence product. A RAG pipeline scores a resume against job descriptions. Integrated Anthropic Claude via native SDK and OpenAI GPT via Microsoft Semantic Kernel. Azure App Service API, React/TypeScript frontend on Azure Static Web Apps, GitHub Actions CI/CD. Live at https://match.lamplightlabs.com. Includes multiple authentication schemes, rate limiting, idempotent writes, background jobs, and API versioning, backed by 158 automated tests.",
    tags: ["AI / RAG", "C# / .NET", "Azure", "React / TypeScript"],
  },
  {
    years: "FEB 2023 - FEB 2024",
    range: "Feb 2023-Feb 2024",
    title: "Senior Software Engineer",
    company: "First Franklin Financial · Application Engineering",
    employer: "First Franklin Financial Corporation via Find Great People",
    detail:
      "Built a Git-based source control and PR review workflow for custom JavaScript inside the DecisionLender SaaS platform, replaced a manual loan-export process with Azure Functions, Key Vault, and Storage Tables, and introduced API versioning and a Windows Service.",
    facts:
      "Created a Git-based source-control and PR workflow for custom JavaScript inside the MeridianLink DecisionLender SaaS platform, replacing a UI-dependent process with no change history or peer review. Re-engineered a manual Real Estate loan-export process using Azure Functions, Key Vault, and Storage Tables. Introduced API versioning across ASP.NET Core APIs and built a Windows Service routing customer statements.",
    tags: ["Azure Functions", "Git / CI/CD", "SQL", "Financial services"],
  },
  {
    years: "FEB 2024 - MAR 2026",
    range: "Feb 2024-Mar 2026",
    title: "Senior Software Engineer",
    company: "First Franklin Financial · Reporting Team",
    employer: "First Franklin Financial Corporation via Find Great People",
    detail:
      "Reassigned to lead Git and development-standards adoption for the Power BI reporting team. Refactored 30+ stored procedures from cursor-based to set-based logic and used Datadog to find bottlenecks, cutting runtime 60-80 percent. One job dropped from 6+ hours to under 30 minutes. Also built SQL/Python checks for a SQL Server-to-Snowflake migration.",
    facts:
      "Moved to the Power BI reporting team at the company's request and led Git-based source-control and development-standards adoption there. Refactored 30+ stored procedures from cursor-based to set-based logic, using Datadog to isolate bottlenecks, cutting runtime 60-80 percent, with one job dropping from 6+ hours to under 30 minutes. Built the Python/SQLAlchemy QA process that validated a SQL Server to Snowflake data migration.",
    tags: ["SQL Server", "Power BI", "Snowflake", "Performance tuning"],
  },
  {
    years: "MAY 2022 - FEB 2023",
    range: "May 2022-Feb 2023",
    title: "Senior Software Developer",
    company: "Veterans Health Administration · Booz Allen",
    employer: "Veterans Health Administration via Booz Allen Hamilton",
    detail:
      "Built C# Dynamics 365 integrations on a 30+ person Agile program modernizing veteran travel reimbursement claims.",
    facts:
      "C# Dynamics 365 plugins and API integrations for veteran travel reimbursement on a 30+ person Agile modernization program. Wrote unit and integration tests under TDD disciplines.",
    tags: ["C#", "Dynamics 365", "TDD", "Federal"],
  },
  {
    years: "OCT 2020 - MAY 2022",
    range: "Oct 2020-May 2022",
    title: "Senior Software Developer",
    company: "BlueCross BlueShield of South Carolina",
    employer: "BlueCross BlueShield of South Carolina via Trident Solutions",
    detail:
      "Shipped a production compliance evidence platform in six weeks against an original three-month, three-developer estimate. Built Splunk dashboards for 150 assessors.",
    facts:
      "Delivered a compliance evidence-collection system in six weeks with 2.5 developers, against an estimate of three developers for three months. Built with Python, SQLAlchemy, and asyncio. Created Splunk dashboards for 150 assessors.",
    tags: ["Python", "SQLAlchemy", "Splunk", "Healthcare"],
  },
  {
    years: "NOV 2018 - OCT 2020",
    range: "Nov 2018-Oct 2020",
    title: "Senior Software Engineer",
    company: "U.S. Department of State - Global Financial Services",
    employer: "U.S. Department of State Global Financial Services via SOS International",
    detail:
      "Supported payroll, accounting, and currency-exchange systems serving U.S. posts in 134+ countries and 180 currencies. Automated batch and OS-level work, investigated production incidents, and contributed to web development and process improvements.",
    facts:
      "Production support and full-stack development for financial systems used across 134+ countries and 180 currencies. Automated batch operations via PowerShell and BMC Control-M, and performed root-cause analysis on production incidents.",
    tags: ["PowerShell", "ASP.NET MVC", "Entity Framework", "Federal"],
  },
];

export const earlierRoles: EarlierRole[] = [
  {
    years: "JUN 2015 - NOV 2018",
    range: "Jun 2015-Nov 2018",
    title: "Field Support Lead / Software Engineer",
    company: "Iberon LLC - Army AIE II+ Contract",
    detail:
      "Developed C# and Ruby on Rails for Army automated gate and access-control systems. Provided Tier III field support and evaluated SDKs for installations nationwide.",
    facts:
      "C# and Ruby on Rails for Army automated gate and access-control systems. Tier III field support.",
  },
  {
    years: "NOV 2014 - JUN 2015",
    range: "Nov 2014-Jun 2015",
    title: "Lead Software Engineer",
    company: "Technology Industries Inc.",
    detail:
      "Led solutions for FAA and Pentagon identity and access-management projects. Built RESTful .NET services, documented APIs, and set up Azure environments.",
    facts:
      "FAA and Pentagon identity and access management, REST .NET services, and Azure environments.",
  },
  {
    years: "MAY 1999 - NOV 2014",
    range: "May 1999-Nov 2014",
    title: "Senior Software Engineer / Acting Supervisor",
    company: "BAE Systems - Charleston, SC",
    detail:
      "Spent 15 years progressing from developer to acting supervisor of a five-person team building Army installation-entry systems, C4I applications, portals, reports, and integrations. Received the BAE Systems Chairman's Award for Innovation six times.",
    facts:
      "Progressed from developer to acting supervisor of a five-person team building Army access-control applications and integration tools. Received the Chairman's Award for Innovation six times.",
  },
];

export const principles: [string, string][] = [
  [
    "Own the outcome",
    "I take work all the way from a tough problem to a dependable production release.",
  ],
  [
    "Make it make sense",
    "Clear architecture, usable documentation, and honest communication are part of the engineering.",
  ],
  [
    "Improve the system",
    "I look for the process behind the bug, and the small change that keeps it from coming back.",
  ],
];

/**
 * Renders the CAREER section of the twin's system prompt from the same role
 * data the timeline uses, so a change in one place reaches both.
 */
export function buildCareerProfile(): string {
  const recent = roles
    .map((role) => `- ${role.title}, ${role.employer} (${role.range}): ${role.facts}`)
    .join("\n");

  const earlier = earlierRoles
    .map((role) => `- ${role.title}, ${role.company} (${role.range}): ${role.facts}`)
    .join("\n");

  return [
    "CAREER PROFILE",
    `${profile.name} is a senior software engineer based in ${profile.location}, with ${profile.years} years of production engineering experience. ${profile.availability} ${profile.summary} ${profile.education}.`,
    "",
    "CAREER",
    recent,
    earlier,
    "",
    "CONTACT",
    `Email: ${profile.email}. Phone: ${profile.phone}. Website project: ${profile.projectUrl}.`,
  ].join("\n");
}
