# Realtor Email Generator

A web app for **Compass Line Ventures** that helps real estate agents
generate 5 professional cold-outreach emails in seconds, powered by the
Anthropic Claude API.

Agents fill out a short form (name, city/state, target audience, unique
selling point, call to action), click **Generate**, and get five
ready-to-send emails — each with a one-click **Copy** button.

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) — navy + white design system
- [@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript)
  on a server route, so your API key never reaches the browser
- Optimized for one-click deploy to [Vercel](https://vercel.com/)

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
cp .env.example .env.local
# then edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, click **New Project** and import the repository.
3. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` — your Anthropic API key.
   - `ACCESS_CODES` — comma-separated list of subscriber codes
     (e.g. `CLV-MARIA-9X4K,CLV-BRIAN-2P7W`). Leave empty to allow
     unrestricted access (local dev only).
4. Deploy. Vercel auto-detects the Next.js framework; no extra config
   is needed.

## Access control & rate limiting

- **Access codes** — every `POST /api/generate` request must include
  an `accessCode` matching one of the codes in the `ACCESS_CODES` env
  var. Mint a new code per Squarespace subscriber, email it to them,
  and add it to the env var (Vercel auto-redeploys on change). To
  revoke a customer's access, remove their code from the list.
- **Rate limit** — the server caps each IP at 10 generations per
  hour. This is a soft, in-memory limit (resets on cold start) — good
  enough as a safety net while traffic is low. Swap for Upstash
  Ratelimit when you outgrow it.

## Project structure

```
app/
  api/generate/route.ts   # Server route that calls Claude
  EmailGenerator.tsx      # Form + results UI (client component)
  layout.tsx              # Root layout + metadata
  page.tsx                # Landing page shell
  globals.css             # Tailwind layers + design tokens
tailwind.config.ts        # Navy color palette
```
