# Technology Stack

## Frontend

- Next.js with TypeScript
- Tailwind CSS
- shadcn/ui for accessible, practical components (in `src/components/ui/`). Dropdowns always use the shadcn `Select` from `src/components/ui/select.tsx`, never a native `<select>`; with React Hook Form, wire it through `<Controller>`.
- Aceternity UI selectively for hero sections or visual effects
- React Hook Form and Zod for forms and validation
- Fabric.js or Konva for the Design Studio canvas

## Backend Direction

Start with a modular Next.js/NestJS backend or a separate NestJS API. Keep the domain boundaries clear so a Go worker can be introduced later if needed.

Core modules:

- Authentication and organizations
- Users, shops and teams
- Products, variants, and SKUs
- Designs and design versions
- Orders and fulfillment
- Payments and user balances
- Marketplace integrations
- Notifications

## Data and Files

- PostgreSQL for users, shops, products, designs, orders, and payment records
- S3-compatible object storage for original designs, generated files, and mockups
- Redis for caching, rate limiting, and job coordination
- BullMQ or another queue for image processing and fulfillment jobs

## Image Processing

- `sharp`/libvips for PNG and TIFF generation
- Validate dimensions, aspect ratio, resolution, transparency, color profile, and file size
- Store immutable design versions so an order always references the exact approved artwork

## Integrations

- MQC: official API if available; otherwise use an approved file/SFTP workflow
- Marketplaces: TikTok Shop, Shopee, and Shopify adapters
- Payments: Midtrans/Xendit for Indonesia; Stripe Connect for international payments where supported
- Email: Resend, Postmark, or similar
- Shipping: integrate through the warehouse or a shipping aggregator later

## Infrastructure

- Cloudflare for DNS, CDN, WAF, and country rules
- Managed PostgreSQL
- Managed Redis
- S3-compatible storage
- Sentry and structured logs for monitoring
- CI/CD with automated tests and migrations

## Security Requirements

- Tenant isolation between users (and their shops)
- Role-based access for users, admins, designers, and operators
- Signed URLs for private files
- Encrypted marketplace credentials and payment data
- Virus scanning for uploaded files
- Audit logs for design approval, order changes, and payment changes

## Sensitive Data in Code & Docs

Never put sensitive data in the repository — source code, mock/seed data, tests, docs (including these agent files), comments or commit messages.

- **Secrets:** no API keys, tokens, passwords, webhook secrets, private keys or connection strings. Read them from environment variables; real values live only in `.env.local` (git-ignored via `.env*`) or the hosting provider's secret settings. If an example file is needed, commit `.env.example` with empty or dummy values.
- **Client exposure:** only values that are safe to publish may use the `NEXT_PUBLIC_` prefix — anything with that prefix ships to the browser.
- **Personal data:** no real names, emails, phone numbers, addresses, ID numbers or bank/card details of users, recipients, staff or clients. Use obviously fake data: `example.com` emails, placeholder phone numbers, made-up names and addresses.
- **Business data:** no real customer orders, shop credentials, supplier (MQC) contracts or private pricing. Catalog values stay placeholders until verified for launch.
- **Legal & company details:** keep company name, registered address and contact emails as `[BRACKETED]` placeholders (see `src/lib/legal/documents.ts`) until the business confirms them.
- **Logs & errors:** never log secrets, tokens, full card data or full personal details; mask them (e.g. last 4 digits only).
- **The prototype stores everything in `localStorage`** — never enter real personal or payment data into it.

If a secret is committed by mistake, treat it as leaked: rotate it immediately, then remove it from history.

## MVP Principle

Use mocked marketplace/MQC data first. Prove the Design Studio, design conversion, SKU mapping, order review, and admin workflow before building every external integration.
