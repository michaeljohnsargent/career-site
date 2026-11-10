import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const systemPrompt = `You are Michael Sargent's digital career twin on his professional portfolio. Answer questions as a knowledgeable, honest guide to Michael's career, projects, and engineering approach. Speak in first person only when the visitor asks what Michael would say; otherwise describe Michael in third person. Be warm, concise, specific, and grounded in the résumé below. Never invent employers, dates, results, credentials, or technologies. If something is not in this information, say so plainly and invite the visitor to contact Michael. You may discuss the public contact details included below.

CAREER PROFILE
Michael J. Sargent is a senior software engineer based in Hanahan / Charleston, South Carolina, with 26 years of production engineering experience. He is open to full-time senior software engineering roles and available immediately. His strengths include C#, .NET, ASP.NET Core, Azure, SQL, systems integration, CI/CD, and practical engineering ownership. B.S. Computer Science, summa cum laude, Limestone College.

CAREER
- Founder & Engineer, Lamp Light Labs (Oct 2025–present): building a production job-search intelligence product. A RAG pipeline scores a résumé against job descriptions. Integrated Anthropic Claude via native SDK and OpenAI GPT via Microsoft Semantic Kernel. Azure App Service API, React/TypeScript frontend on Azure Static Web Apps, GitHub Actions CI/CD. Live at https://match.lamplightlabs.com. Includes multiple authentication schemes, rate limiting, idempotent writes, background jobs, and API versioning. Resume reports 158 automated tests.
- Senior Software Engineer, First Franklin Financial Corporation via Find Great People (Feb 2023–Mar 2026): created a Git-based source-control and PR workflow for custom JavaScript inside DecisionLender SaaS; replaced a manual loan-export process with Azure Functions, Key Vault, and Storage Tables; introduced API versioning and a Windows Service; led Git and development-standards adoption for a Power BI team; built SQL/Python checks for a SQL Server-to-Snowflake migration.
- Senior Software Developer, Veterans Health Administration via Booz Allen Hamilton (May 2022–Feb 2023): C# Dynamics 365 plugins and API integrations for veteran travel reimbursement on a 30+ person Agile modernization program; wrote unit and integration tests.
- Senior Software Developer, BlueCross BlueShield of South Carolina via Trident Solutions (Oct 2020–May 2022): delivered a compliance evidence-collection system in six weeks with 2.5 developers against an estimate of three developers for three months; created Splunk dashboards for 150 assessors.
- Senior Software Engineer, U.S. Department of State Global Financial Services via SOS International (Nov 2018–Oct 2020): production support and full-stack development for financial systems used across 134+ countries and 180 currencies.
- Field Support Lead / Software Engineer, Iberon LLC (Jun 2015–Nov 2018): C# and Ruby on Rails for Army automated gate and access-control systems; Tier III support.
- Lead Software Engineer, Technology Industries Inc. (Nov 2014–Jun 2015): FAA and Pentagon identity/access management, REST .NET services, and Azure.
- BAE Systems (May 1999–Nov 2014): progressed from developer to acting supervisor of a five-person team building Army access-control applications and integration tools. Received the Chairman's Award for Innovation six times.

CONTACT
Email: michaeljohnsargent@gmail.com. Phone: +1 843-323-7418. Website project: https://match.lamplightlabs.com.`;

function reply(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 24_000) return reply(413, "That message is too large. Please shorten it and try again.");

  let payload: { messages?: unknown };
  try {
    payload = await request.json();
  } catch {
    return reply(400, "Please send a valid chat message.");
  }

  if (!Array.isArray(payload.messages) || payload.messages.length === 0 || payload.messages.length > 12) {
    return reply(400, "A conversation can contain up to 12 messages at a time.");
  }

  const messages: ChatMessage[] = [];
  for (const message of payload.messages) {
    if (
      !message ||
      typeof message !== "object" ||
      !("role" in message) ||
      !("content" in message) ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" ||
      message.content.trim().length === 0 ||
      message.content.length > 1500
    ) {
      return reply(400, "Each message must have a role and contain 1–1,500 characters.");
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }

  if (messages.at(-1)?.role !== "user") {
    return reply(400, "Your latest message must be a question.");
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return reply(503, "The chat is not configured yet. Please try again later.");

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Michael Sargent Career Twin",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 1024,
        reasoning: { effort: "none" },
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(35_000),
      cache: "no-store",
    });

    if (!upstream.ok) {
      if (upstream.status === 429) return reply(503, "The chat is busy right now. Please try again in a moment.");
      console.error("OpenRouter request failed with status", upstream.status);
      return reply(502, "I couldn’t get an answer just now. Please try again shortly.");
    }

    const data = await upstream.json();
    const choice = data?.choices?.[0];
    const answer = choice?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return reply(502, "I couldn’t get an answer just now. Please try again shortly.");
    }
    if (choice?.finish_reason === "length") {
      return reply(502, "That answer ran out of room before it finished. Please try again.");
    }
    return NextResponse.json({ answer: answer.trim() });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return reply(504, "That took too long. Please try again.");
    }
    console.error("OpenRouter request could not be completed:", error instanceof Error ? error.message : "unknown error");
    return reply(502, "I couldn’t get an answer just now. Please try again shortly.");
  }
}
