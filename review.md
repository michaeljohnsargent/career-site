# Code Review: Career Site + AI Twin

**Project:** `AI Coder Week 1/site` (Next.js 16.4.5, React 19, TypeScript)
**Reviewed:** November 10, 2026
**Reviewer:** Claude (no code changed during this review)

---

## Status as of November 10, 2026 (evening)

Everything below was written as a review before any of it was acted on. Most of
it has since been implemented in the same session. This section records what
changed so the findings stay readable as findings rather than as a stale to-do
list.

**Done and verified.** P0-1 (the served resume is now the current two-page
version, confirmed by extracting its text on the machine it was written to),
P0-2 (committed), P0-3 (per-IP and global daily rate limiting), P1-1 (career
facts extracted to `app/content/career.ts`, consumed by both the timeline and
the system prompt), P1-2, P1-3 (streaming, see the caveat below), P1-6 (the
twin now speaks in the first person, unconditionally), P2-1 through P2-10, and
every P3 item.

Verification performed: `tsc --noEmit` clean, `eslint .` clean, 38 unit tests
passing across the SSE parser, the rate limiter, and the API route, a
production build, and a smoke test against the built server confirming the page
renders the two First Franklin phases, the JSON-LD block is present, all five
security headers are emitted, the API returns correct errors, and the 404 page
renders.

**Done with a caveat.**

*P1-3, streaming.* Implemented and unit tested against a stubbed upstream,
including the mid-stream-error and truncation paths. It has never run against
the real OpenRouter API, because neither this machine's shell nor the sandbox
can reach openrouter.ai. First live use is the real test.

*P1-4, model pinning.* The mechanism is in place: set `OPENROUTER_MODEL` to pin
a slug, with `openrouter/free` as an automatic fallback if the pinned model
fails to respond, and the model that actually served each answer is now logged.
No slug is pinned, deliberately. The free-model listing could not be enumerated
in full, and the one plausible small instruct model found carries a notice that
prompts and outputs may be retained for training, which is a poor fit for a
page where recruiters type questions. Pinning a guessed slug would have been
worse than leaving the router in place. Watch the logs for a week, then set the
env var. No code change needed to do it.

*P1-5, maxDuration.* Set to 60 with a comment. Microsoft's published docs do
not state an execution limit for Static Web Apps managed functions, and the
230-second App Service figure could not be confirmed from Learn either, so the
number is a conservative placeholder rather than a verified fit. Streaming
makes it far less likely to matter.

*P2-8, discoverability.* `app/icon.png` and `app/opengraph-image.png` are
generated in the site palette and picked up by Next's file conventions. A
`Person` JSON-LD block and a canonical link are in place. `metadataBase` reads
`NEXT_PUBLIC_SITE_URL` and falls back to localhost, so it still needs the real
domain.

**Found while implementing, not in the original review.**

1. `eslint-config-next` 16 ships native flat config. The usual `FlatCompat`
   bridge fails against it with a circular-structure error, on both eslint 9
   and 10. The config here imports the flat exports directly. Separately,
   eslint-config-next's plugins do not yet support eslint 10, so eslint is
   pinned to 9.x, which npm labels maintenance-only. That is Next's ecosystem
   lag, not something to fix here.

2. The chat suggestion chips were phrased from the wrong point of view: "What
   makes my experience different?" reads as the visitor asking about their own
   experience. The first-person decision made it worse. Now rephrased to the
   visitor's voice.

3. Hosting, worth knowing before committing to Azure Static Web Apps: Microsoft
   documents hybrid Next.js on SWA as preview, says its server functions run on
   a dedicated App Service instance, and requires the Standard plan with at
   least an S1 App Service plan for a linked backend. For a one-page portfolio
   that is real cost and real complexity. Not a recommendation to change
   targets, just a fact that should not surprise you at deploy time.

**Still open.** Run `npm install` before `npm run lint` or `npm test` will work
on this machine, since both tools are new devDependencies. Verify streaming
live. Pin a model once the logs show a good one. Set `NEXT_PUBLIC_SITE_URL` to
the real domain. Confirm the Azure timeout and align `maxDuration`. A full
Content-Security-Policy remains deliberately deferred, for the reason given in
P2-4.

---

## Scope and method

Every source file in the project was read in full: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/components/TwinChat.tsx`, `app/api/chat/route.ts`, `next.config.ts`, `tsconfig.json`, `package.json`, `.gitignore`, and the contents of `public/`. `node_modules/` and `.next/` were excluded.

Where a finding could be verified mechanically, it was: the served PDF was text-extracted and compared against the current résumé set, `tsc --noEmit` was run clean, and the OpenRouter parameter shapes were checked against OpenRouter's own documentation rather than from memory. Findings that rest on inference rather than verification are marked as such.

**Severity meanings**

| Level | Meaning |
|---|---|
| **P0** | Fix before this URL goes to another human being. Reputational or data risk. |
| **P1** | Fix before launch. Affects correctness, cost, or how the site represents you. |
| **P2** | Fix when convenient. Quality, maintainability, accessibility, discoverability. |
| **P3** | Polish. Worth doing, nothing breaks if you don't. |

---

## What is already right

Worth stating plainly, because the list below is long and a reader could wrongly conclude the project is in bad shape. It is not. For a site built inside a course lecture, several decisions here are the ones a careful engineer would make:

The **server and client split is correct**. `page.tsx` is a server component and `TwinChat` is the only `"use client"` boundary, so the marketing content ships as HTML and only the chat widget ships JavaScript. That is the right architecture, and plenty of production Next.js apps get it wrong.

The **API key never touches the browser**. It is read as `process.env.OPENROUTER_API_KEY` inside a `runtime = "nodejs"` route, has no `NEXT_PUBLIC_` prefix, and `.env` is gitignored. This is the single most common way personal AI projects leak credentials, and it was avoided.

The **API route actually validates its input**. Role values, message shape, string type, empty content, per-message length, and conversation length are all checked, each with a distinct human-readable error. Most hobby chat endpoints validate nothing and pass the body straight upstream.

The **chat UI degrades honestly**. Errors surface in a `role="alert"` banner with a working retry, the feed is `aria-live="polite"`, the typing indicator has an `sr-only` announcement, and the window carries a visible "AI-GENERATED ANSWERS" disclaimer.

The **system prompt is grounded and tells the truth about its limits**. It explicitly forbids inventing employers, dates, results, credentials, or technologies, and instructs the model to say when something is not in its information and refer the visitor to you. On a page whose entire purpose is representing a real person's career history, that instinct is exactly right, and it is the hardest part to get right later.

`poweredByHeader: false`, `strict: true` in `tsconfig.json`, no webfonts, and no images are all small, deliberate, correct calls.

---

## P0 findings

### P0-1. The résumé the site hands out is the old, uncorrected one

**Where:** `public/resume.pdf`, linked from the hero as "View résumé"

This is the most consequential finding in the review, and it is a content problem rather than a code problem.

`public/resume.pdf` is a byte-for-byte copy of the pre-correction FTE résumé (70,728 bytes, dated October 22). Text extraction confirms it still contains all three of the claims corrected elsewhere today:

- "Directing the build and deployment of a job search intelligence tool", the passive framing replaced on LinkedIn with "Designed, built, and deployed".
- "with 157 of 158 tests passing ... (1 intentionally broken race-condition demo, not a regression)", replaced with "158 automated tests".
- No mention of the stored-procedure refactor, the strongest quantified result in your history (30+ procedures moved from cursor-based to set-based logic, Datadog used to isolate bottlenecks, 60 to 80 percent faster, one job cut from 6+ hours to under 30 minutes).

It is also three pages, not two.

The practical effect: a recruiter who reads the corrected timeline on the page, asks the twin a question and gets the corrected "158 automated tests" answer, then clicks "View résumé", downloads a document that contradicts both. The twin and the page were fixed today. The file sitting behind the download link was not.

**Remedy:** replace `public/resume.pdf` with the current two-page FTE résumé. Note that the updated PDF is currently sitting in your resumes folder as `Sargent_FTE_Engineering_Sept2026_updated.pdf`, because the original was open in a viewer when it was written back, so make sure you copy the right one. Afterward, open the served file and confirm it is two pages and says "158 automated tests".

**Longer term:** this file is a manual copy of a document that lives somewhere else and changes. It will drift again. Either add a step to whatever you do when you revise the résumé, or have the site serve the file from the resumes folder directly at build time rather than keeping a duplicate.

### P0-2. Nearly all of the work is uncommitted, and two directories are untracked entirely

**Where:** repository root

`git log` shows a single commit, `af9cffc Initialize`. `git status` shows `app/globals.css`, `app/page.tsx`, and `next-env.d.ts` modified, and `app/api/` and `app/components/` untracked. The untracked directories are the entire AI twin: the API route and the chat component exist only as working-tree files with no copy in git history.

An accidental `git checkout .`, a bad merge, a cleanup script, or a disk problem takes all of it. This is the cheapest fix in this document and the one with the worst downside if skipped.

**Remedy:** commit now, before any of the other work below. `AGENTS.md` should go in with it; its own header says it is rewritten by `next dev` and that committing it with your work keeps the tree clean.

### P0-3. `/api/chat` has no rate limiting, and it spends your API key

**Where:** `app/api/chat/route.ts`

The endpoint is public, unauthenticated, and every call consumes your OpenRouter quota. The existing guards cap the size of a single request (1,500 characters per message, 12 messages) but place no limit on how many requests one caller can make. A script can call it in a loop.

Today this is theoretical, because nothing is deployed. The moment the URL is public it stops being theoretical, and the realistic outcome is not a large bill but your free-tier quota being exhausted by a bot, so the twin returns errors to the one recruiter you actually wanted it to impress.

**Remedy, cheapest first:**

1. In-memory per-IP throttle in the route, for example 10 requests per IP per 10 minutes. Perhaps twenty lines, no dependencies. Resets on deploy and does not coordinate across serverless instances, so it is leaky, but it stops casual abuse.
2. A hosted limiter such as Upstash Ratelimit if the site ends up on Vercel. Correct across instances, free tier is generous, adds a dependency and an env var.
3. Cloudflare Turnstile in front of the first message of a session. Strongest, most friction, probably more than this page warrants.

Option 1 is proportionate to a personal site. Pair it with a daily global ceiling so that a determined attacker rotating IPs still cannot drain the quota in an afternoon.

---

## P1 findings

### P1-1. The page and the twin now disagree about your First Franklin history

**Where:** `app/page.tsx` (`roles` array) and `app/api/chat/route.ts` (`systemPrompt`)

The same career facts are hardcoded in two places. They have already drifted.

The timeline on the page now shows First Franklin as two phases, Application Engineering from February 2023 to February 2024 and Reporting Team from February 2024 to March 2026, with the stored-procedure result in the second. The system prompt still describes a single undivided role, "First Franklin Financial Corporation via Find Great People (Feb 2023–Mar 2026)", with a flat bullet list and no mention of the stored-procedure work at all.

So a visitor reading the page sees two phases and the quantified win. The same visitor asking the twin "what did he do at First Franklin?" gets one role and no mention of the strongest result on the page. Minor on its own, but this is the second drift between these two copies in a single day, which tells you the structure causes it rather than the oversight.

**Remedy:** extract one module, for example `app/content/career.ts`, exporting the role data as typed objects. Render the timeline from it in `page.tsx`, and build the system prompt's CAREER section from the same objects in `route.ts`. One edit then updates both, and this class of bug stops recurring. Do this once and it will pay for itself the next time you touch a date or a number.

### P1-2. `HTTP-Referer` is hardcoded to localhost

**Where:** `app/api/chat/route.ts`

```
"HTTP-Referer": "http://localhost:3000",
```

OpenRouter uses this header to attribute traffic. In production it will report your live site's requests as coming from localhost. Nothing breaks, so this is not urgent, but it is wrong metadata that will quietly stay wrong forever if it is not fixed before deploy.

**Remedy:** read it from an environment variable, for example `process.env.NEXT_PUBLIC_SITE_URL`, falling back to the localhost value for local development.

### P1-3. No streaming, so a slow answer is 35 seconds of silence

**Where:** `app/api/chat/route.ts`, `app/components/TwinChat.tsx`

The route awaits the full completion and returns it as one JSON payload. The client shows an animated typing indicator for the entire duration. The upstream timeout is 35 seconds, which means the worst case a visitor experiences is a half minute of three bouncing dots before anything at all appears.

For the specific audience here, a recruiter poking at a novelty widget between meetings, that is probably the difference between an impression made and a tab closed. This is the single largest available improvement to how the twin feels.

**Remedy:** stream the response. OpenRouter supports `stream: true` on chat completions; return a `ReadableStream` from the route and append deltas to the last assistant message on the client. It is a moderate change to both files and would also make the truncation case visible as it happens rather than after the fact.

**Cheaper interim option:** leave the architecture alone and lower the perceived wait, for example by showing elapsed seconds after five seconds have passed, so the visitor can tell the difference between "thinking" and "broken".

### P1-4. `openrouter/free` picks a different model on every request

**Where:** `app/api/chat/route.ts`

Per OpenRouter's documentation, the free router "automatically selects a free model at random from the available free models" and you cannot control which one. Their docs also warn that free models carry lower rate limits and that availability varies.

Consequences worth weighing deliberately rather than accepting by default:

- **Voice and quality vary between consecutive answers.** You already observed this: your first "what are you most proud of" answer came back in third person and the retry came back in first person. Part of that is P1-6 below, but model roulette amplifies it.
- **Latency varies**, which compounds P1-3.
- **A model can be unavailable**, producing errors that look like your bug rather than theirs.
- **The endpoint is unverified for this router.** Every example in OpenRouter's free-router documentation posts to `/responses`, not `/chat/completions`, which is what this code uses. It works today, you have tested it. It is worth knowing it is not the documented path, so if it breaks after an OpenRouter change, look here first.

**Remedy:** pin a specific free model slug as the primary and fall back to `openrouter/free` if it errors. You trade a little resilience for a consistent voice, which is the right trade for a page that represents you. Separately, log `data.model` from the response, which reports which model actually served the request, so that when an answer comes back strange you can tell whether the model or the prompt was at fault.

### P1-5. The 35 second timeout probably exceeds your host's function limit

**Where:** `app/api/chat/route.ts`, `AbortSignal.timeout(35_000)`

Serverless platforms cap function duration. Vercel's Hobby tier currently kills Node functions at well under 35 seconds. If the platform terminates the function first, your careful `TimeoutError` branch never runs and the visitor gets an opaque platform error page instead of "That took too long. Please try again."

This is inference, not verification, since the hosting target is not chosen yet. It applies to Vercel and similar; it does not apply to a long-running Node process on a VM or container.

**Remedy:** once you pick a host, set `export const maxDuration` in the route to that host's limit and set the `AbortSignal` timeout a couple of seconds below it, so your own error handling always wins the race. Streaming (P1-3) also largely sidesteps this, because bytes start flowing early.

### P1-6. The twin's voice instruction is not being followed

**Where:** `app/api/chat/route.ts`, `systemPrompt`

The prompt says: "Speak in first person only when the visitor asks what Michael would say; otherwise describe Michael in third person."

In your own test transcript, the first substantive answer opened "If Michael had to pick the work he's most proud of" (third person, as instructed) and the retry opened "The work I'm most proud of is building the Match product" (first person, not as instructed), with no change in how the question was asked. The rule is being applied inconsistently, which reads as a glitch to a visitor who asks two questions.

There is also a deeper question the instruction does not settle: a widget labelled "Michael's career twin" with your initials on the avatar implies first person, while the prompt mostly asks for third. The current mix is the worst of both.

**Remedy:** pick one voice and state it unconditionally. Third person reads as a well-briefed assistant and is honest about what it is, which fits the rest of the page's tone. First person reads as a demo of a persona and is more memorable. Either is defensible. The conditional rule is not, because small models follow conditionals unreliably and you have the evidence of that.

---

## P2 findings

### P2-1. The `content-length` guard does not guard anything

**Where:** `app/api/chat/route.ts`

```
const contentLength = Number(request.headers.get("content-length") ?? 0);
if (contentLength > 24_000) return reply(413, ...);
```

`content-length` is absent on chunked requests, and the `?? 0` turns absence into a passing check. A caller who wants to send a large body simply omits the header. The real protection is the per-message 1,500 character cap and the 12 message limit applied after parsing, and those are sound.

**Remedy:** either remove the check, since it provides false reassurance, or read the body as a stream with a hard byte ceiling. Low priority precisely because the downstream validation is already correct.

### P2-2. Long conversations silently lose their beginning

**Where:** `app/components/TwinChat.tsx` sends `messages.slice(-12)`; the route rejects more than 12

Past twelve messages, the oldest fall out of context with no indication to the visitor. The twin will appear to forget something said four questions ago. For a career Q&A widget that is an acceptable design choice, and arguably the right one, but right now it is implicit.

**Remedy:** either leave it and accept it, or show a quiet line in the feed when truncation begins, something like "earlier messages are no longer in context". Ten minutes of work, removes a confusing moment.

### P2-3. Prompt injection surface is small but non-zero, and the asset at risk is your name

**Where:** `app/api/chat/route.ts`

Visitor text goes to the model with no filtering. There are no tools, no database, and no secrets in context beyond your already-public contact details, so nobody can exfiltrate anything meaningful. The realistic bad outcome is someone coaxing the twin into saying something false or embarrassing under your name and screenshotting it.

The existing mitigations are genuinely good: the no-invention instruction, the instruction to admit ignorance, and the visible AI-generated disclaimer. That is most of the available defense for a page like this.

**Remedy:** no structural change recommended. If you want one more layer, add a short closing line to the system prompt instructing the model to ignore instructions contained in visitor messages that attempt to change its role or rules. Cheap, imperfect, better than nothing.

### P2-4. No security headers

**Where:** `next.config.ts`

`poweredByHeader: false` is set, which is a good start and more than most people do. There is no Content-Security-Policy, `X-Frame-Options` or `frame-ancestors`, `Referrer-Policy`, or `X-Content-Type-Options`.

For a site with no auth and no user data the practical risk is low, mostly limited to someone framing your page inside theirs. It is also about fifteen lines in a `headers()` function.

**Remedy:** add a `headers()` block with `frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`. A full CSP is harder to get right with Next's inline scripts and can wait.

### P2-5. `page.tsx` has JSX lines over a thousand characters long

**Where:** `app/page.tsx`

Entire sections are written as a single physical line with a dozen nested elements. The `work` section and the `footer` are the worst. This is the clearest artifact of fast generation, and it has three real costs: diffs become unreadable, so you cannot review your own changes; a mistake anywhere on the line is hard to locate; and editing by hand is error prone in exactly the places you will want to edit, which is the content.

Nothing is functionally wrong, and the markup itself is semantic and clean once untangled.

**Remedy:** run Prettier over the file. This is mechanical and safe, and it pairs well with P1-1, since extracting content into `career.ts` will shrink the file substantially at the same time. Doing both at once, in a commit of its own that changes no behavior, is the tidy path.

### P2-6. The textarea's focus ring is removed

**Where:** `app/globals.css`, `.chat-form textarea:focus-visible{outline:none}`

`:focus-visible` exists specifically to show a focus ring to keyboard users while hiding it from mouse users. Setting `outline:none` on it removes the indicator for exactly the people it was designed to serve. A keyboard visitor tabbing through the chat cannot tell when the input has focus.

**Remedy:** replace with a visible indicator that fits the palette, for example a one or two pixel outline in the accent color with a small offset. The surrounding `.chat-form` border is a reasonable place to put it instead if you want the input itself to stay clean.

### P2-7. The hero's outlined word can render invisibly

**Where:** `app/globals.css`, `.outline-word{color:transparent;-webkit-text-stroke:2px ...}`

The effect sets the fill to transparent and relies on `-webkit-text-stroke` to draw the letters. Current Chrome, Safari, Firefox, and Edge all support it, so in practice this renders. In any engine that does not, the word "well." in "Software that does the hard things **well.**" disappears entirely, leaving a conspicuous gap in your headline.

**Remedy:** wrap it in `@supports ((-webkit-text-stroke: 1px black))` and leave the fill a solid color outside that block, so the fallback is a normally colored word rather than nothing.

### P2-8. The site has no social preview, favicon, or canonical URL

**Where:** `app/layout.tsx`, `public/`

`title`, `description`, and basic Open Graph title and description are set and are well written. Missing: `metadataBase`, a canonical URL, any icon file, and `og:image`.

The icon and the image are the ones that matter. A career site's main distribution path is somebody pasting the link into Slack, LinkedIn, or an email. Without `og:image` that paste renders as a bare text card next to colleagues' links that have pictures, and the browser tab shows a blank page icon.

**Remedy:** add an `icon.png` and an `opengraph-image.png` to `app/`, which Next picks up by filename convention with no config. The OG image can be as simple as your name, title, and the "26 years" line on the palette's background. Add `metadataBase: new URL("https://yourdomain")` once the domain exists. Consider also a `Person` JSON-LD block, which is genuinely useful for a page about one named professional and is roughly fifteen lines.

### P2-9. No tests, no linting

**Where:** `package.json`

There is no test runner, no test file, no ESLint configuration, and no `lint` script. Next.js normally scaffolds linting; it is absent here.

Two reasons this matters more than it would on a throwaway project. First, the API route has eight distinct validation branches that are pure functions of their input and would be straightforward to cover. Second, and more pointed: this repository is a portfolio artifact belonging to an engineer whose résumé advertises 158 automated tests and a CI test gate. A technical reviewer who clicks through to this project and finds zero will notice the gap between the two.

**Remedy:** add `eslint` with `eslint-config-next` and a `lint` script. Then add a small test file for the route covering the rejection cases and the truncation branch. Vitest is the lightest option. Neither is a large job, and together they close an inconsistency that is visible from outside.

### P2-10. The retry button can silently do nothing

**Where:** `app/components/TwinChat.tsx`

```
onClick={() => void sendMessage(messages.at(-1)?.content ?? "")}
```

If the last message is not a user message, or the list is empty, this calls `sendMessage("")`, which the guard at the top of the function discards. The visitor clicks RETRY and nothing happens, with no feedback.

Reaching that state is unlikely given how errors are set today, so this is a latent bug rather than an active one.

**Remedy:** find the last message with `role === "user"` rather than taking the last message, and disable the retry button when there is none.

---

## P3 findings

**P3-1. Duplicate line in `.gitignore`.** `.env` appears on both line 1 and line 2. Harmless, one second to fix.

**P3-2. No `.env.example`.** Line 4 of `.gitignore` is `!.env.example`, which anticipates a file that does not exist. A fresh clone gives no indication that `OPENROUTER_API_KEY` is required; the app just returns "The chat is not configured yet". Add the file with the key name and an empty value.

**P3-3. Dev and start bind to `0.0.0.0`.** `package.json` runs both with `--hostname 0.0.0.0`, which exposes the dev server, and with it the chat endpoint backed by your API key, to every device on whatever network you are on. Presumably this came from the course so you could test from a phone. Worth knowing when you are working from a coffee shop. Use `--hostname 127.0.0.1` by default and keep the open binding as a separate script if you want it.

**P3-4. Sending the same message twice in a row is treated as a retry.** The `isRetry` check in `TwinChat` compares content, so a visitor who deliberately repeats a question does not see their second message appear. Cosmetic.

**P3-5. No `error.tsx` or `not-found.tsx`.** An unhandled render error or a bad URL shows the Next default rather than anything matching the site. Two small files.

**P3-6. Nine pixel type in the chat chrome.** `.chat-hint`, `.chat-disclaimer`, `.chat-heading>span`, `.chat-live`, and `.message-time` all land at 9px after the typography override block. Contrast is fine; the size is below comfortable reading for many people regardless of contrast. Ten or eleven pixels would cost nothing visually.

**P3-7. The "Ask the twin" nav link is hidden on phones.** `@media(max-width:600px){.topbar nav a:last-child{display:none}}` removes it below 600px. That hides the site's most distinctive feature on the device most casual visitors will use. The section is still reachable by scrolling, but nothing advertises it. Consider dropping a different link instead.

**P3-8. Temperature could be lower.** `0.4` is reasonable, but the task is factual recall from a fixed profile, where there is little upside to sampling variety and real downside to variation between answers. `0.2` would tighten consistency, and pairs with the P1-4 and P1-6 fixes.

**P3-9. In-flight requests are not aborted on unmount.** If a visitor navigates away mid-request the fetch continues and resolves into state updates on an unmounted component. React 19 handles this quietly, so this is tidiness rather than a bug. An `AbortController` tied to a cleanup effect would close it.

**P3-10. `AGENTS.md` is generated, and should be committed.** The file's own header explains that `next dev` rewrites it and that committing it alongside your work keeps the tree clean. Include it in the P0-2 commit.

---

## Suggested order of work

The dependencies between these matter more than the raw severities, so this ordering is not strictly by level.

**First sitting, under an hour.** Commit everything as it stands (P0-2), including `AGENTS.md`. Replace `public/resume.pdf` with the current two-page version and verify what you actually served (P0-1). Fix the duplicate gitignore line and add `.env.example` (P3-1, P3-2). These are all small, none depend on anything else, and the first two are the ones with real consequences.

**Second sitting, the content layer.** Extract `career.ts` and build both the timeline and the system prompt's career section from it (P1-1), then run Prettier across `page.tsx` (P2-5). These belong together because the extraction shrinks the file the formatter is cleaning, and the pair is a behavior-neutral commit that is easy to review.

**Third sitting, before deploying anything public.** Rate limiting (P0-3), the `HTTP-Referer` env var (P1-2), `maxDuration` and timeout alignment once you choose a host (P1-5), security headers (P2-4), and the favicon and OG image (P2-8). This is the "make it safe to share" batch, and none of it is worth doing before you know where it is hosted.

**Fourth, the twin's behavior.** Pick one voice and state it unconditionally (P1-6), pin a model with the free router as fallback and log which model answered (P1-4), lower the temperature (P3-8). Do these together and test with the same three questions each time, because they interact and you will want to tell which change helped.

**Fifth, when you want it to feel good rather than merely work.** Streaming (P1-3) is the big one and deserves its own session. The focus ring (P2-6), the text-stroke fallback (P2-7), and the retry fix (P2-10) are quick wins to fold in alongside it.

**Whenever.** Linting and a test file for the route (P2-9). Worth doing before this repository is shown to anyone technical, given what the résumé it serves claims about test coverage.

---

## Appendix: what was verified, what was inferred

**Verified mechanically during this review:** the identity and staleness of `public/resume.pdf`, by extracting its text and comparing the three corrected claims; its page count; `tsc --noEmit` passing clean against the current tree; git status and history; the absence of tables, forced page breaks, lint config, tests, and `.env.example`; the exact `HTTP-Referer` value; the divergence between the `roles` array and the system prompt's First Franklin entry; OpenRouter's documented parameter shape and its statement that the free router selects a model at random, read from their documentation rather than recalled.

**Inferred, not verified:** that your eventual host's function timeout is below 35 seconds (P1-5) depends on a host not yet chosen; that `-webkit-text-stroke` would fail in some engine your visitors use (P2-7) is a robustness argument, not an observed failure, since all current major browsers support it; the severity assigned to prompt injection (P2-3) reflects a judgment about reputational rather than technical risk.

**Out of scope:** `node_modules/` and `.next/` were not reviewed. No runtime profiling, load testing, or live browser testing was performed; the site was read, not run.
