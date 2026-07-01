# CLAUDE.md

Guidance for Claude Code (and future contributors) when working in this repository.

## What this app is

**Lista de Deseos** ("Wish List") is an Angular single-page app for creating and sharing gift/wish
lists — similar to a gift registry. A logged-in user can own several wish lists (e.g. one per event:
baby shower, birthday, wedding, Christmas, graduation), add products to them with a name/price/image/
purchase link, and share a public URL (`listadedeseos.es/@username[/list-name]`) so friends and family
can browse the list and mark items as "reserved" so gifts aren't duplicated. Lists can also pull in
items from a linked Steam wishlist or Amazon wishlist. There's a contact list feature and a public
demo account (`/@admin/demo`).

Backend is a separate REST API (not in this repo), consumed via `ApiService`. Local dev expects it at
`http://localhost:8000/api/` (`src/environments/environment.ts`).

## Tech stack

- **Angular 20**, standalone components only (no NgModules), `ChangeDetectionStrategy.OnPush` +
  manual `ChangeDetectorRef.markForCheck()/detectChanges()` — this codebase does **not** use Angular
  signals.
- **Tailwind CSS 3** for all styling (`tailwind.config.js`), utility classes written inline in
  templates. Component `.scss` files are mostly empty/unused; prefer Tailwind classes over new SCSS.
- **RxJS** for async (HTTP calls return `Observable`s from `ApiService`).
- **Font Awesome** (`@fortawesome/angular-fontawesome`) for icons, `ngx-toastr-notifier` for toasts
  (via `Utils.ToastUtils`).
- Karma/Jasmine for unit tests (`npm test`).

## Architecture

- **Routing** (`src/app/app.routes.ts`): a custom `UrlMatcher` (`userMatcher`) recognizes
  `@username[/wishListName]` URLs and routes them to `WishListComponent`. Everything renders inside
  `PageLoggedComponent` (header + `<router-outlet>` + footer). `AuthGuard` protects private routes
  (`/list`, `/user`, `/profile`, `/contact/list`).
- **API layer** (`src/apiConnection/`): `ApiService` is a thin generic REST wrapper
  (`getPetition`/`getById`/`save`/`deleteById`). `JwtInterceptor` attaches the auth token,
  `ErrorInterceptor` handles HTTP errors, `AuthenticationService` tracks the logged-in user,
  `AuthGuard` guards routes. `Utils.urls` (`src/utils/utils.ts`) centralizes API endpoint paths.
- **Pages** (`src/pages/`): route-level components (dashboard, wish-list, login/register, profile,
  contact, steam/amazon integrations, verify email, etc).
- **Components** (`src/components/`): reusable/shared pieces (header, footer, product card, modals —
  product form, wishlist form, delete confirm — steam/amazon widgets, page-logged shell).
- **Wish list themes** (`src/enum/theme.ts`): `ThemeConfig` is the single source of truth for the 5
  event themes (`babyshower`, `cumpleanos`, `boda`, `navidad`, `graduacion`). Each theme defines a
  label, subtitle, an SVG banner (`public/assets/banners/*.svg`), badge classes, hero classes, page
  background classes, a `dark` flag (whether the banner artwork is a dark background, so overlaid text
  needs light colors instead of the default dark grays), and a color palette. Helper methods
  (`getTheme`, `getThemeClasses`, `getHeroClasses`, `getPageClasses`, `getAllThemes`,
  `isDarkTheme`) build the Tailwind class strings consumed by `WishListComponent` (`getThemeLabel`,
  `getThemeClasses`, `getHeroClasses`, `getPageBackgroundClasses`, `getBannerImage`,
  `getThemeSubtitle`, `isDarkTheme` in `src/pages/wish-list/wish-list.component.ts`). When a wish
  list has a `theme` set, its hero section and full page background are tinted to match that theme,
  and the hero's own decorative banner SVG is shown at full opacity (each banner is a self-contained
  illustration with its own background gradient + CSS keyframe animations, not just a texture); when
  no theme is set, the page falls back to the brand's default purple/pink gradient (also the global
  `body` background in `src/styles.scss`) with generic floating decoration.
- **Banner source of truth**: the 5 files in `public/assets/banners/*.svg` originate from a Claude
  Design project ("Cinco banners temáticos", `claude.ai/design/p/e509f29e-982f-430d-ad2c-dea0ad0455af`)
  imported via the `DesignSync` tool. If the banners need visual changes, prefer updating the design
  there and re-importing, or edit the SVGs directly — they're self-contained (background gradient +
  decorative shapes + `<style>` keyframes), no external assets.
- **Global brand style**: purple → pink gradients (`from-purple-*` / `to-pink-*`) for primary CTAs and
  headings across pages (see `dashboard.component.html`, `header.component.html`), soft rounded-2xl
  white cards on a warm pastel `body` gradient background.

## File tree

```
src/
├── apiConnection/            REST client, auth service/guard, HTTP interceptors
│   ├── ApiService.ts
│   ├── AuthGuard.ts
│   ├── authentication.service.ts
│   ├── ErrorInterceptor.ts
│   ├── JwtInterceptor.ts
│   └── model/user.ts
├── app/                      Root app shell + routing
│   ├── app.ts / app.html / app.scss
│   ├── app.config.ts
│   └── app.routes.ts
├── components/                Shared/reusable UI components
│   ├── amazon/                Amazon wishlist widget
│   ├── card/                  Product card
│   ├── customDelete/          Generic delete-confirmation modal
│   ├── customModal/           Generic modal shell
│   ├── footer/
│   ├── header/
│   ├── loading/
│   ├── page-logged/           Layout wrapper (header + outlet + footer)
│   ├── product-form/          Add/edit product modal
│   ├── socialNetworkAccess/   Google login button, etc.
│   ├── steam/                 Steam wishlist widget
│   ├── user-form/
│   └── wishlist-form/         Create/edit wish list modal (name, theme, dates, measurements...)
├── enum/
│   └── theme.ts               ThemeConfig — wish list theme definitions + class helpers
├── environments/               environment.ts / environment.prod.ts (API base URL)
├── pages/                      Route-level pages
│   ├── amazon/, steam/         Full-page Amazon/Steam browse views
│   ├── contact/                Contact form + contact-list (private)
│   ├── dashboard/              Public landing page
│   ├── login/, register/, verify/   Auth flows
│   ├── profile/                User profile incl. clothing/shoe measurements
│   ├── social-network/google-callback/   OAuth redirect handler
│   ├── user/                   Account settings
│   └── wish-list/               Main wish list view (hero banner, product grid, admin panel)
├── utils/
│   └── utils.ts                Utils.urls (API endpoints) + Utils.ToastUtils (toast helper)
├── index.html, main.ts, styles.scss
public/
├── assets/banners/*.svg        Per-theme illustrated hero banners
├── assets/icon/logo.svg
└── assets/img/empty.webp       Fallback product image
.github/workflows/pipeline.yml  CI pipeline
tailwind.config.js               Tailwind theme (primary/secondary/accent palettes, plugins)
```

## Commands

- `npm start` — `ng serve` (dev server)
- `npm run build` / `npm run build:prod` — production build
- `npm test` — Karma/Jasmine unit tests

## Conventions to follow

- New components: standalone, `imports: [...]` array in the `@Component` decorator, no NgModules.
- Prefer Tailwind utility classes in templates over adding SCSS.
- Use the existing purple/pink brand gradient for primary actions/headings; use `ThemeConfig` (not
  hardcoded colors) for anything that should vary per wish-list theme.
- Spanish is the UI language — keep user-facing copy in Spanish.
- Keep `Utils.urls` as the single place API paths are defined; don't hardcode endpoint strings.

## Changelog

Keep this section updated — see the `update-claude-memory` skill (`.claude/skills/update-claude-memory/SKILL.md`),
which should run after each change to this repo and append an entry here.

- 2026-07-01 — Restyled the wish-list hero: banner image now sits under a soft dark gradient scrim for
  legibility, decorative blobs became theme-agnostic blurred white "bokeh" circles, and the hero got
  rounded bottom corners + shadow. Wired up the previously-unused `ThemeConfig.getHeroClasses` /
  `getPageBackgroundClasses` helpers so the hero section and full page background now reflect the wish
  list's `theme` (falls back to the default brand gradient when no theme is set).
  (`src/pages/wish-list/wish-list.component.html`)
- 2026-07-01 — Added this `CLAUDE.md` and the `update-claude-memory` skill.
- 2026-07-01 — Redrew all 5 wish-list theme banners (`public/assets/banners/*.svg`) from scratch,
  replacing the old inconsistent "clipart people" illustrations (mismatched viewBoxes, baked-in text,
  Comic Sans) with a hand-authored cohesive set built on the exact `ThemeConfig` colors. Superseded the
  same day (see next entry) by a proper Claude Design import — kept here for history only.
- 2026-07-01 — Replaced the hand-authored banners with a real design import via the `DesignSync` MCP
  tool from the Claude Design project "Cinco banners temáticos"
  (`claude.ai/design/p/e509f29e-982f-430d-ad2c-dea0ad0455af`, file `Banners.dc.html`): each of the 5
  `public/assets/banners/*.svg` is now a self-contained, finished illustration (own gradient
  background + decorative shapes + CSS `<style>` keyframe animations — `floaty`/`floaty2`/`sway`/
  `twinkle`) at a shared `1600x440` viewBox, distinct per theme (pastel dreamy for baby shower,
  botanical/minimal for wedding, warm confetti for birthday, dark elegant navy for graduation, dark
  green for christmas). Because the banners are now finished designs rather than a texture, the hero
  in `wish-list.component.html` shows them at full opacity (removed the old opacity-40 + heavy dark
  scrim, kept only a light bottom scrim for text legibility) and only shows the generic floating-blob
  decoration when no theme banner is set. Added a `dark` flag per theme in `ThemeConfig`
  (`src/enum/theme.ts`) plus `ThemeConfig.isDarkTheme` / `WishListComponent.isDarkTheme`, and made the
  hero's date-limit/counter/subtitle text switch between dark-gray (light banners) and white
  (dark banners: navidad, graduacion) so it stays legible against either.
- 2026-07-01 — Re-imported just the baby shower banner from the same Claude Design project (its
  `Banners.dc.html` section had been revised there): swapped the old hanging-balloons decoration for
  on-theme baby items — pacifier, bottle, onesie, socks, rattle, plus the existing moon/stars/clouds
  and two new small hearts. Same `1600x440` viewBox and pastel background as before; only
  `public/assets/banners/babyshower.svg` changed.
