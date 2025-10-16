# Repository Guidelines

## Project Structure & Module Organization
- `api/` contains the Express/TypeScript backend plus Jest specs and seeds; keep new services under `api/server` and colocate route-specific utilities.
- `client/` hosts the Vite-powered React front end; UI logic lives in `client/src`, with feature folders (`pages`, `components`, `hooks`) mirroring routing boundaries.
- `packages/` stores shared libraries (`data-provider`, `api`, `data-schemas`, etc.). Update these first when changing cross-cutting types or adapters.
- `config/` houses operational scripts for updates, user management, and migrations; copy patterns from here for any new maintenance tasks.
- `e2e/` contains Playwright specs and configs used by CI; snapshot assets sync to `e2e/playwright-report`.

## Build, Test, and Development Commands
- `npm install` from the repo root bootstraps all workspaces; scripts handle post-install tasks.
- `npm run backend:dev` starts the API with Nodemon and enables hot reload.
- `npm run frontend:dev` runs the Vite client on port 3080 for local development.
- `npm run build:packages` compiles shared workspace packages before shipping client or API bundles.
- `npm run e2e` launches Playwright against `e2e/playwright.config.local.ts`.

## Coding Style & Naming Conventions
- Prefer TypeScript; default to 2-space indentation and single quotes where ESLint permits.
- React components and classes use `PascalCase`; hooks `useCamelCase`; config helpers `snake_case` only for environment keys.
- Lint with `npm run lint`; format with `npm run format`. Tailwind classes should stay ordered via the Prettier Tailwind plugin.

## Testing Guidelines
- Client and API suites run via `npm run test:client` and `npm run test:api`; tests live near the code under `__tests__` or `*.spec.ts`.
- Add Playwright coverage for critical flows in `e2e/tests`; name specs after the feature (`chat-history.spec.ts`).
- Seed data-sensitive tests with the in-repo fixtures to keep CI deterministic.

## Commit & Pull Request Guidelines
- Follow the existing conventional-emoji prefix (`⚡ perf:`, `🐛 fix:`, `📎 feat:`) and keep subject lines imperative and under 72 characters.
- Group related changes per commit; include migration scripts or config edits in the same commit as the feature they support.
- Pull requests should describe behavior changes, list test commands executed, attach relevant screenshots/GIFs for UI work, and reference linked issues.

## Security & Configuration Tips
- Store secrets in `.env` or `librechat.yaml`; never commit credentials.
- Log sanitization lives in `api/server/utils/logger`; extend it when adding new PII fields to avoid leaks.
