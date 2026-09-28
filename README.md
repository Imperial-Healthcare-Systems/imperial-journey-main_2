# Imperial Journeys — Next.js

A Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS) port of the original single-file `imperial-journeys.html`.

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build

```bash
npm run build
npm start
```

## Structure

```
app/
├── layout.tsx              # Root layout, fonts (Poppins + Playfair), metadata, OG tags
├── page.tsx                # Composes all sections
├── globals.css             # Tailwind + custom @layer components (.btn, .eyebrow, .reveal)
└── components/
    ├── TopBar.tsx          # Address, phone, email, socials
    ├── SiteHeader.tsx      # client — sticky nav, mobile menu, active-link IO
    ├── Hero.tsx            # client — 3-slide auto-rotating hero with pause-on-hover
    ├── Showcase.tsx        # 6 hover-reveal journey cards (next/image)
    ├── About.tsx           # client — about text + story-film modal ("Coming soon")
    ├── Features.tsx        # 3 feature cards
    ├── Identity.tsx        # Parallax-style identity strip
    ├── Services.tsx        # 6-card services grid
    ├── Contact.tsx         # Office addresses + ContactForm
    ├── ContactForm.tsx     # client — submits via mailto: to info@imperialhealthsystems.com
    ├── Footer.tsx
    ├── RevealOnScroll.tsx  # client — global IntersectionObserver for `.reveal` elements
    └── JsonLd.tsx          # TravelAgency structured data
```

## Notes & TODOs

- **Form delivery** uses `mailto:info@imperialhealthsystems.com`. Swap for Formspree / Resend / a `/api/contact` route when you want server-side delivery.
- **Email domain mismatch** still present from the original: most displayed emails use `@imperialhealthsystems.in` (.in) but the form submits to `@imperialhealthsystems.com` (.com). Reconcile when you confirm the canonical domain.
- **Social links** are placeholder `#` hrefs. Drop real URLs into `TopBar.tsx` and `Footer.tsx`.
- **Story film modal** shows a "Coming soon" card. Wire in a real video when ready.
- **next/image + Unsplash**: configured via `next.config.mjs`. Add other CDNs to `images.remotePatterns` if needed.
