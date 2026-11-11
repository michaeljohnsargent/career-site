# Deploying this site

Target: Vercel's free Hobby plan. Chosen because Azure's free and shared App
Service plans do not support SSL, so a custom domain on Azure free cannot serve
HTTPS, and a recruiter clicking an insecure link is the one failure this site
cannot afford. Vercel is made by the same company as Next.js, so this stack
needs no configuration to run there.

Everything below is yours to do. None of it needs a credit card.

---

## Before you start

Two things to know:

- `.env` is gitignored and is **not** tracked by git. Verified. Your OpenRouter
  key will not be pushed. Do not add it to any file that is tracked.
- There is currently no git remote and a batch of uncommitted work. Commit
  before you push.

## 1. Commit what's waiting

```bash
git add -A
git commit -m "Streaming twin, rate limiting, shared career content, tests, deploy prep"
```

## 2. Put it on GitHub

Create an empty repository at github.com (no README, no .gitignore, it would
conflict). Public is fine and arguably better, since a recruiter can read the
code. Nothing secret is in it. Then:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

## 3. Import into Vercel

1. Go to vercel.com and sign in **with GitHub**. That links the accounts and
   saves a step later.
2. Add New, then Project, then import the repository you just pushed.
3. Vercel will detect Next.js on its own. Do not change the build settings.
4. Before clicking Deploy, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `OPENROUTER_API_KEY` | your key, the same one in your local `.env` |
   | `NEXT_PUBLIC_SITE_URL` | `https://<project-name>.vercel.app` for now |

   Leave `OPENROUTER_MODEL` unset. The route falls back to OpenRouter's free
   router and logs which model answered, which is how you will later decide
   what to pin.

5. Deploy. First build takes a couple of minutes.

## 4. Test the thing that has never been tested

The streaming chat has only ever run against a stubbed response. This is its
first contact with the real API. Open the deployed URL and ask the twin two or
three questions.

What you are looking for:

- text appears **progressively**, a few words at a time, rather than all at
  once after a pause. That is streaming working.
- the answers are in **first person** ("I built", not "Michael built").
- no half-finished sentences. If one stops mid-thought, the truncation notice
  should appear under it rather than it silently looking complete.

If answers arrive all at once after a long pause, streaming is not working and
the place to look is `app/api/chat/stream.ts`, which is isolated and has tests
around it.

In Vercel's dashboard under the deployment's Logs you will see one line per
answer saying which model served it. Watch those for a week before pinning one.

## 5. Point your own domain at it

A subdomain of `lamplightlabs.com` keeps the site on your own brand rather than
a platform's.

1. In the Vercel project: Settings, then Domains, then add
   `careers.lamplightlabs.com` (or whatever you prefer).
2. Vercel will show you a `CNAME` record to create.
3. Add that record wherever `lamplightlabs.com`'s DNS is managed, the same
   place `match.lamplightlabs.com` is configured.
4. Wait for it to verify. HTTPS is issued automatically and costs nothing.

## 6. Fix the URL you set in step 3

Once the real domain works, go back to Environment Variables and change
`NEXT_PUBLIC_SITE_URL` to `https://careers.lamplightlabs.com`, then redeploy.

This matters more than it looks. That value is what makes the Open Graph image
URL absolute, so until it is right, pasting your link into LinkedIn or Slack
will render a bare text row instead of the preview card. It is also the
canonical URL and the site identifier sent to OpenRouter.

---

## After it is live

- Re-run `npm install` locally if you have not yet, or `npm run lint` and
  `npm test` will fail. eslint and vitest are new dependencies.
- Every push to `main` redeploys automatically. Pull requests get their own
  preview URLs.
- Hobby is restricted to non-commercial personal use. A career portfolio with
  no payments, ads, or affiliate links fits that. If Lamp Light Labs ever sells
  something from this domain, that site needs a paid plan.

## Known limits, so they do not surprise you

- Rate limiting is in-process: 10 requests per IP per 10 minutes and 300 per
  day globally. It resets on every deploy and each serverless instance counts
  separately. Fine for a personal site, not a real defense. If it ever needs to
  be real, move the counters to Upstash Redis and keep the same interface.
- The twin holds the last 12 messages. Past that it forgets the beginning, and
  the chat says so rather than pretending otherwise.
