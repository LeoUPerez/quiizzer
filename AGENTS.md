# Quiizzer contributor guide

## Project conventions

- Stack: Next.js App Router, React, TypeScript, and Tailwind CSS.
- Use the `@/` import alias for imports rooted at `src/` (for example, `@/components/Button`).
- Run `npm run typecheck` after TypeScript or component changes.
- Keep server-only secrets in environment variables; never expose `SUPABASE_SECRET_KEY` to client components.

## Project structure

Use `src/` as the single home for application source code. The Next.js App Router must live in `src/app/`, not in a root-level `app/` directory. Keep configuration, environment files, middleware, and static public assets at the repository root.

```text
quiizzer/
├── public/                  # Static images, fonts, and icons served from `/`
├── src/
│   ├── app/                 # Next.js App Router and file-system routes
│   │   ├── (auth)/          # Route groups that do not affect the URL
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── api/             # Server-side route handlers
│   │   │   └── example/
│   │   │       └── route.ts
│   │   ├── favicon.ico      # Next.js metadata file
│   │   ├── globals.css      # Application-wide styles
│   │   ├── layout.tsx       # Root layout shared by every route
│   │   ├── loading.tsx      # Route-level loading UI
│   │   ├── error.tsx        # Route-level error boundary
│   │   ├── not-found.tsx    # Global 404 UI
│   │   └── page.tsx         # Homepage (`/`)
│   ├── components/          # Reusable UI following Atomic Design
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   ├── hooks/               # Reusable React hooks
│   ├── lib/                 # DB clients, SDK setup, and shared infrastructure
│   ├── services/            # External API and application service logic
│   ├── types/               # Shared TypeScript types and DTOs
│   └── utils/               # Pure utilities and helper functions
├── .env.local               # Local environment variables; never commit secrets
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── proxy.ts                 # Next.js 16 request proxy (formerly middleware)
```

Architecture rules:

- Create routes exclusively through folders inside `src/app/`.
- Use route groups such as `(auth)` when routes need shared organization or layouts without adding a URL segment.
- Keep `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `not-found.tsx` focused on routing and page composition; move reusable UI into `src/components/`.
- Keep API handlers in `src/app/api/**/route.ts` and move reusable business or integration logic into `services/` or `lib/`.
- Put browser-facing static assets in `public/` and reference them from the root, for example `/images/example.png`.
- Put reusable stateful behavior in `hooks/`, external service calls in `services/`, infrastructure clients in `lib/`, and side-effect-free helpers in `utils/`.
- Do not create both `app/` and `src/app/`; `src/app/` is the canonical location.
- Keep Next.js 16 request interception in the root `proxy.ts`; do not add a parallel `middleware.ts`.

## Public home

- The public home page is served at `/inicio` by `src/app/inicio/page.tsx`.
- The existing exam catalogue remains at `/`.
- Public sign-in and registration controls open the shared `AuthModal` through `useAuthModal` without navigating away.
- Category links use `/?subject=<subject>`; the catalogue filters its cards by that query value.
- The hero illustration is a static asset at `public/images/login_page_image.png`, referenced as `/images/login_page_image.png`.

## Component architecture

The public home follows a lightweight Atomic Design structure under `src/components/`:

- `atoms/`: single-purpose visual primitives such as icons and `Brand`.
- `molecules/`: small composed UI blocks such as `CategoryCard`.
- `organisms/`: complete page sections such as `PublicHeader`, `HomeHero`, `PracticeCategories`, and `PublicFooter`.
- `templates/`: page compositions. `templates/PublicHome.tsx` assembles the public-home organisms.

`src/components/PublicHome.tsx` is a compatibility export for the public-home template. Import it from there unless a component needs a more specific layer.

Keep new public-home components in the lowest appropriate layer. Do not create a new component for a trivial wrapper or single text element.

Write React components in a readable multi-line form. Use a component body with an explicit `return` for templates and organisms, put nested JSX elements on their own lines, and avoid single-line JSX trees. Compact one-line atoms are acceptable only when they remain immediately readable.

For stateful application flows, keep side effects and API orchestration in a controller or hook, and place the visual composition in `templates/`. `src/PharmacologyQuiz.tsx` is the quiz-flow controller; `templates/QuizApplication.tsx` renders its dashboard, exam, results, notifications, and registration overlays.

## Accessibility and responsive behavior

- Use semantic landmarks (`header`, `nav`, `main`, `section`, and `footer`).
- Preserve keyboard-visible focus styles on interactive controls.
- Use `aria-current="page"` for the current public navigation item.
- Decorative icons must be hidden from assistive technology.
- Preserve the mobile-first responsive layout; avoid fixed heights and horizontal overflow.
