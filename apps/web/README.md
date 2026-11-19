# LabourLens Web Application

The web client for LabourLens, a Pakistan-focused marketplace connecting employers with domestic and skilled workers.

## Phase 1

The current app establishes the public landing page and route structure using Next.js App Router, TypeScript, and Tailwind CSS. Routes at `/sign-in`, `/register`, and `/dashboard/{employer,worker,admin}` are previews. Authentication, authorization, API calls, and real marketplace data are not implemented yet.

The landing-page profile cards are illustrative demo content, not real people or listings. Verification labels describe evidence status and do not guarantee safety.

## Commands

Run from this directory with Node.js and npm installed:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

PowerShell may require `npm.cmd` if local execution policy blocks `npm.ps1`.

