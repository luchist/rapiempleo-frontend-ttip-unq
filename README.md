[![CI](https://github.com/luchist/rapiempleo-frontend-ttip-unq/actions/workflows/ci-build.yml/badge.svg)](https://github.com/luchist/rapiempleo-frontend-ttip-unq/actions/workflows/ci-build.yml)

# rapiempleo-frontend-ttip-unq

Repositorio Frontend para el Trabajo de Inserción Profesional — UNQ.

## About the project

RapiEmpleo is a job board web application. It serves two kinds of users, distinguished by the
`typeUser` flag on the logged-in account:

- **Postulante** (candidate) — browses and searches job offers, marks favorites, applies with a CV,
  manages up to 4 CV slots on their profile, and tracks their applications on a kanban board
  (`Aplicado → Entrevistando → EsperandoRespuesta → Cerrado / Aceptado`).
- **Ofertante** (recruiter) — registers a company, publishes offers, reviews the CVs received for
  each offer, saves candidates, and looks at hiring statistics.

Search supports a colon syntax (`titulo: analista, empresa: Google`) as well as an AI-assisted mode
that sends the raw query to the backend and turns it into structured search params.

This repository is **only the frontend**. It talks to the Spring backend at
[luchist/rapiempleo-backend-ttip-unq](https://github.com/luchist/rapiempleo-backend-ttip-unq),
which must be running for the app to do anything useful.

**Stack:** React 19 + Vite + React Router v7, MUI, plain JSX (no TypeScript). Playwright for e2e tests.

## Setup

### Prerequisites

- **Node.js 22+** (the CI build runs on 22).
- **pnpm** — this is enforced: a `preinstall` hook rejects `npm install` / `yarn`.
  Enable it with `corepack enable`, or install it globally with `npm i -g pnpm`.
- The **backend running on `http://localhost:8080`**. The API base URL is currently hardcoded in the
  page files, so this port is not configurable without editing the source.

### Install and run

```bash
git clone https://github.com/luchist/rapiempleo-frontend-ttip-unq.git
cd rapiempleo-frontend-ttip-unq
pnpm install
pnpm run dev
```

The dev server starts on <http://localhost:5173>. Start the backend first, then log in from the
landing page (`/`) — every other route expects an authenticated user, since the JWT is read from
`localStorage` and sent as a `Bearer` token on each request.

### Scripts

| Command | Description |
|---|---|
| `pnpm run dev` | Start the dev server with HMR |
| `pnpm run build` | Production build into `dist/` |
| `pnpm run preview` | Serve the production build locally |
| `pnpm run lint` | Run ESLint |
| `pnpm test:e2e` | Run the Playwright e2e suite |
| `pnpm test:e2e:headed` | Same, with a visible browser and `SLOW_MO=500` (useful for debugging) |

### End-to-end tests

The e2e suite logs in against a real backend, so it needs credentials for an existing account.
Copy the example env file and fill it in:

```bash
cp .env.example .env.test
```

```dotenv
E2E_EMAIL=your-test-account@example.com
E2E_PASSWORD=your-test-password
```

`.env.test` is gitignored — do not commit it. Playwright starts the dev server itself, but the
backend still has to be up on port 8080. Then:

```bash
pnpm test:e2e
```

An HTML report is written to `playwright-report/`.

## Routes

| Path | Page |
|---|---|
| `/` | Login |
| `/home` | Offer search + grid |
| `/register` | Recruiter registration |
| `/ofertas/:id` | Offer detail |
| `/ofertante/:id` | Recruiter profile |
| `/ofertante/:id/create-oferta` | Create an offer |
| `/postulante/:id` | Candidate profile + CVs |
| `/postulante/:id/board` | Applications kanban board |
| `/estadisticas` | Statistics |

## License

See [LICENSE](LICENSE).
