# Order Tracking

A mobile order tracking screen for an e-commerce app, rebuilt around one goal: a customer should be able to glance
at the screen and immediately understand where their package is, when it's arriving, and what to do next — including
when something has gone wrong.

**Live demo:** https://order-tracking-livid-nu.vercel.app

The demo bar at the top of the screen switches between nine scenarios, each backed by its own mock order. Every
scenario also has its own URL, e.g. `?scenario=delayed`, so any state can be linked to directly.

| Required scenario          | URL                          |
| -------------------------- | ---------------------------- |
| Delayed order              | `?scenario=delayed`          |
| Delivered but not received | `?scenario=not-received`     |
| Tracking not available yet | `?scenario=tracking-pending` |

Standard journey (`in-transit`, `out-for-delivery`, `delivered`) and system states (`slow-network`, `load-error`,
`not-found`) are also wired up — see [`src/lib/scenarios.ts`](src/lib/scenarios.ts) for the full list.

## Contents

- [Why it's built this way](#why-its-built-this-way)
- [Stack](#stack)
- [Getting started](#getting-started)
- [Mock data and API](#mock-data-and-api)
- [Project structure](#project-structure)
- [Design and interaction notes](#design-and-interaction-notes)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

## Why it's built this way

The brief's core complaint was that "Processing / Shipped / Out for Delivery / Delivered" doesn't tell a customer
anything when their situation isn't one of those four happy-path labels. So the app doesn't treat the order's raw
`stage` as the thing to display. Instead, [`lib/tracking.ts`](src/lib/tracking.ts) derives a richer **situation**
from the order (`delayed`, `not_received`, `investigating`, …) by layering the carrier's delay notice, the
estimated-delivery window, and any open support case on top of the four-stage state machine. Every other part of the
UI — the headline, the badge color, which card renders below the timeline, even the wording on the progress steps —
reads off that one derived value, so the three required edge cases aren't bolted-on special screens; they're the
same component tree responding to a richer status.

```
Order (stage, estimatedDelivery, delay?, delivery?, supportCase?)
        │
        ▼
  summarizeTracking()  →  { situation, tone, headline, detail, keyDate, steps, … }
        │
        ▼
  TrackingScreen renders the situation card that matches
```

## Stack

- **React 19 + TypeScript**, built with **Vite**
- **Tailwind CSS v4** for styling, **lucide-react** for icons
- **Vitest** + **React Testing Library** for tests
- No backend — see [Mock data and API](#mock-data-and-api)

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
```

Other scripts:

```bash
npm run build         # type-check, then build for production
npm run preview       # serve the production build locally
npm test              # run the test suite once
npm run test:watch    # run tests in watch mode
npm run lint           # oxlint
npm run format          # prettier --write .
```

## Mock data and API

There is intentionally no backend. [`src/data/mockApi.ts`](src/data/mockApi.ts) is a small in-memory service with
the same shape a real one would have — async functions that resolve after a simulated delay and can fail — sitting
in front of a set of seed orders in [`src/data/seedOrders.ts`](src/data/seedOrders.ts). Actions taken in the UI
(enabling alerts, confirming receipt, filing a report) mutate that in-memory store, so the app behaves statefully
within a session without needing anything on a server.

Seed order timestamps are generated relative to `Date.now()` at load time, so the demo always reads naturally
("arriving tomorrow", "updated 3 hr ago") no matter when it's opened, rather than showing a hardcoded date that
drifts into the past.

## Project structure

```
src/
├── types/order.ts          Domain types (Order, TrackingEvent, SupportCase, …)
├── data/
│   ├── seedOrders.ts       Mock orders, one per delivery situation
│   └── mockApi.ts          Fake network layer: fetch, mutate, simulate failure
├── lib/
│   ├── tracking.ts         Order → situation, tone, headline, progress steps
│   ├── format.ts           Date/money/relative-time formatting
│   ├── scenarios.ts        The demo's scenario catalogue
│   └── ui.ts               Tone → Tailwind class maps, clipboard helper
├── hooks/
│   ├── useOrderTracking.ts Loads an order, exposes actions (retry, search, confirm, report…)
│   ├── useScenarioParam.ts Keeps the active scenario in the URL
│   └── useNow.ts           Ticking clock so relative labels stay correct
├── components/
│   ├── tracking/           Status hero, progress stepper, history, order summary, help
│   │   └── situations/     One card per situation (delayed, not-received, investigating…)
│   ├── sheets/             Order details, delivery photo, contact support + chat, report flow
│   ├── states/             Loading skeleton, error, not-found
│   ├── ui/                 Button, Card, Sheet, Switch, Toast — small, unopinionated primitives
│   └── demo/               The scenario picker (not part of the product screen itself)
└── App.tsx                 Wires the demo shell around <TrackingScreen>
```

`components/demo/` is the only folder that exists purely for this prototype; everything else is the product UI.

## Design and interaction notes

- **Status hero** — a single card at the top always shows the plain-language situation (never "Stage: shipped"), a
  4-step progress tracker, and the one date that matters right now (ETA, delivery time, or "next update by").
- **Delayed order** — explains _why_ it's late using the carrier's own message, shows the new estimate with the
  original struck through, and turns on a refund/replacement CTA once the delay-guarantee window has passed.
- **Delivered but not received** — asks the customer to confirm receipt first; saying "no" surfaces an optional
  checklist (look around, ask a neighbor, check the photo) before offering to file a report, with a visible
  investigation timeline once one is open.
- **Tracking not available yet** — explicitly explains that this is normal for a new order and shows what happens
  next, rather than rendering an empty or broken-looking tracking history.
- **Loading / error / not found** — a skeleton that mirrors the real layout (nothing reflows on load), a retry
  affordance for failed loads, and an order-number search for a bad or mistyped order number.
- **Sheets** (order details, delivery photo, contact support, report an issue) are true modal dialogs: focus moves
  in and is trapped, `Escape` and a backdrop tap close them, background scroll is locked, and focus returns to the
  triggering control on close.
- **Support chat** is a small canned-response bot that reads the order's situation and replies contextually (a
  delayed order gets a different answer to "where is my package?" than a delivered one).
- Layout targets **360–430px** mobile widths; on wider viewports the demo places the screen in a phone frame next to
  the scenario picker rather than stretching the UI.

## Accessibility

- Every interactive control has an accessible name; icon-only buttons carry `aria-label`.
- The progress stepper and timeline expose their state to screen readers (`aria-current`, visually-hidden state
  text) in addition to color and icon.
- Toasts and the "quick checks" counter use `aria-live` regions.
- Dialogs follow the WAI-ARIA pattern: `role="dialog"`, `aria-modal`, labelled by their heading, a focus trap, and
  restored focus on close.
- Color is never the only signal — delayed/warning states also change the icon, label text, and copy.

## Testing

```bash
npm test
```

41 tests across four files:

- `lib/format.test.ts` — date/time/money formatting, including the "today / tomorrow / weekday / date" and
  same-day-window logic.
- `lib/tracking.test.ts` — the situation derivation for every scenario (delayed, not-received → investigating →
  found again, tracking-pending, etc.) and progress-step state.
- `data/mockApi.test.ts` — the mock backend: order lookup/normalization, typed errors, case creation, and
  situation-aware support replies.
- `App.test.tsx` — integration tests through Testing Library that exercise the real component tree: reporting a
  missing package end-to-end, confirming/denying receipt, dialog focus management, retry-after-error, and searching
  for an order by number.

The app was also driven end-to-end in a real browser (Edge, via Playwright) against the production build across all
nine scenarios at 360px and 390px widths, and through the desktop phone-frame layout, checking for console errors,
horizontal overflow, and the full set of interactions above.

## Deployment

Deployed on [Vercel](https://vercel.com) as a static Vite build. [`vercel.json`](vercel.json) makes that
explicit rather than relying on auto-detection:

- `framework: "vite"`, `buildCommand`/`outputDirectory` — pinned rather than inferred.
- A catch-all `rewrites` entry falls back to `index.html`, so the app never 404s if a route is opened directly.
- Fingerprinted files under `/assets` are served with a one-year immutable cache; `index.html` is always
  revalidated, so a new deploy is picked up immediately without needing a cache bust.

To deploy your own copy:

```bash
npm i -g vercel
vercel --prod
```

Any static host that serves `dist/` with an SPA fallback to `index.html` (Netlify, Cloudflare Pages, GitHub Pages
with a fallback, …) works equally well — the app has no server-side requirements.

## Known limitations

- There is no backend, by design — see [Mock data and API](#mock-data-and-api).
- Delivery-photo, product, and house illustrations are inline SVGs rather than real photography, since no image
  assets were provided.
- State lives in memory only; a refresh resets it to the seed data (the mock API is a stand-in for a real service,
  not a persistence layer).
