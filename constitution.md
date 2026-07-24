# Bright Minds — Constitution

## Mission & Scope
Bright Minds (repo: Kids-Learning-App) is a kids' learning web app with
role-based areas for parents, children, content managers, and admins. Parents
manage children and assign subjects; children access their learning dashboard;
content managers curate learning material. Auth and data are backed by
Supabase.

## Tech Stack
- Framework: Next.js 16 (App Router)
- Language: TypeScript
- UI: React 19 (function components + hooks)
- Styling: Tailwind CSS v4
- Icons: lucide-react
- Backend/Data: Supabase (@supabase/supabase-js)
- Package manager: npm

## Folder Structure
- App routes: `app/` (App Router) — role-based segments:
  `app/parent/`, `app/child/`, `app/content-manager/`, `app/admin/`,
  plus `app/login/`, `app/signup/`, `app/auth/`, `app/reset-password/`,
  `app/api/` (route handlers), `app/contact/`, `app/privacy/`, `app/terms/`
- Landing/shared UI components: `components/` at the repo ROOT
  (e.g. Hero.tsx, Features.tsx, Navbar.tsx, Footer.tsx, Subjects.tsx, Grades.tsx)
- Supabase client: `lib/supabase.ts`
- Global styles: `app/globals.css`
- Root layout: `app/layout.tsx`

## Coding Standards
- TypeScript throughout — type props and Supabase row shapes explicitly
- Function components with hooks; PascalCase components, camelCase functions/vars
- Use the shared Supabase client from `lib/supabase.ts` — do not create new
  client instances
- Use optional chaining for possibly-null profile/data fields (e.g.
  `profile?.full_name`) — the codebase relies on this and TypeScript strict
  mode will flag unguarded access
- Keep role areas separated: parent code under `app/parent/`, child under
  `app/child/`, etc. — do not mix concerns across roles

## Design System / UX
- Match the existing Tailwind styling — reuse spacing, color, and typography
  utility patterns from existing components rather than introducing new styles
- New pages MUST follow the structure and layout of existing pages in the same
  role segment (same layout wrapper, same navigation)
- Reuse existing components (Navbar, Footer, cards) rather than duplicating
- Show loading and empty/null states consistently with existing pages

## Hard Rules
- **The live `components/` directory is at the REPO ROOT.** A legacy
  `src/components/` may exist but is NOT used — never edit `src/` files; make
  UI changes in the root `components/` and `app/` directories only.
- Database is Supabase. Schema changes (ALTER TABLE / CREATE TABLE) CANNOT be
  run automatically via the Supabase REST API — they must be run manually in
  the Supabase SQL editor. New columns must be nullable so existing rows are
  not broken.
- Supabase has Row-Level Security (RLS). When adding columns or tables that
  users read/write, confirm the RLS policies allow the intended access.
- This app does NOT use a generated Supabase types file (e.g.
  `types/supabase.ts` or `lib/database.types.ts`). Do NOT create one — type
  Supabase data inline where needed.
- Do not introduce new state-management or data-fetching libraries — use React
  state/hooks and the Supabase client.
- App Router only — do not add `pages/` router files.
