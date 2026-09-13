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
  label, subtitle, an SVG banner (`public/assets/banners/*.svg`), badge classes (a small pill using a
  light tint/border/text drawn from that theme's accent color — e.g. `cumpleanos` uses ocre `#B4762B`,
  `navidad` uses green `#3E6B52`), hero classes, page background classes, a `dark` flag (metadata about
  whether the banner artwork itself has a dark background — no longer used to switch hero text color,
  see below), and a color palette. Helper methods (`getTheme`, `getThemeClasses`, `getHeroClasses`,
  `getPageClasses`, `getAllThemes`, `isDarkTheme`) build the Tailwind class strings consumed by
  `WishListComponent` (`getThemeLabel`, `getThemeClasses`, `getHeroClasses`,
  `getPageBackgroundClasses`, `getBannerImage`, `getThemeSubtitle`, `isDarkTheme` in
  `src/pages/wish-list/wish-list.component.ts`). As of the 2026-09-13 redesign, `heroClasses` and
  `pageBackgroundClasses` are uniform (`bg-cream-alt` / `bg-cream`) across all 5 themes rather than
  per-theme tinted gradients — only the accent-colored badge pill and, when set, a low-opacity
  (`opacity-20`, cream-scrim-overlaid) banner image behind the hero distinguish one theme from another
  now. `isDarkTheme`/`dark` is kept for potential future use but the hero text is always ink/muted
  colors regardless, since the hero background is always light now.
- **Logo source of truth**: `public/assets/icon/logo.svg` (the browser favicon and the header/footer
  `<img>` logo) originates from a Claude Design project ("Diseño logo Listadedeseos.es",
  `claude.ai/design/p/fa68d04f-b200-4995-9d58-ca2dc6e6d629`, file `Logo listadedeseos.dc.html`) —
  that project explores many logo directions, but only the primary circular seal + star mark was
  implemented — originally in the design's burgundy/champagne colors, since recolored to `ink` black
  `#232019` (circle) + `primary-500` terracotta `#9A4A28` (star), exposed as
  `colors.logo.seal`/`colors.logo.spark` in `tailwind.config.js`. The same mark, with the star given
  the `twinkle` animation, is used in `src/components/loading/loading.component.html`.
- **Banner source of truth**: the 5 files in `public/assets/banners/*.svg` originate from a Claude
  Design project ("Cinco banners temáticos", `claude.ai/design/p/e509f29e-982f-430d-ad2c-dea0ad0455af`)
  imported via the `DesignSync` tool. If the banners need visual changes, prefer updating the design
  there and re-importing, or edit the SVGs directly — they're self-contained (background gradient +
  decorative shapes + `<style>` keyframes), no external assets. They're now shown as a subtle
  low-opacity watermark behind the wish-list hero rather than a full-opacity illustration (see
  2026-09-13 changelog entry).
- **Global brand style**: a warm editorial look imported from a second Claude Design project ("Rediseño
  profesional de listas de deseos", `claude.ai/design/p/4ffff05c-5795-47cc-ae2a-c88c9f373895`, file
  `Lista de Deseos.dc.html`) via the `DesignSync`/`claude_design` MCP tool — replaced the original
  purple/pink gradient brand app-wide on 2026-09-13. `font-serif` (Newsreader) for all headings/large
  numerals, default `font-sans` (Karla) for everything else, both loaded via Google Fonts in
  `src/styles.scss`. Palette lives in `tailwind.config.js` as named tokens (not numbered scales, except
  `primary` which is a full terracotta scale): `primary-{50..950}` (terracotta accent, `500` = #9A4A28),
  `ink`/`ink-hover` (near-black #232019, used for nav/headings/dark solid buttons), `cream`/`cream-alt`
  (#F4F1EC / #FBF9F6 page backgrounds), `line`/`line-soft`/`line-card`/`line-strong` (hairline 1px
  borders — **no box-shadow anywhere** in the new design, cards are always flat bordered), `muted`
  family (warm-gray text tones), `swatch` (empty-image placeholder tiles), `reserved` (green,
  reserved-gift state), `danger` (destructive actions/errors), `admin` (admin-only UI), and `event`
  (the 5 per-wish-list-theme accents, mirrored in `ThemeConfig`). See any recently-touched template
  (header, footer, wish-list, card, dashboard) for the button/card/input/badge class recipes in
  practice — they're consistent across the app.

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
- 2026-09-13 — Reskinned the contact pages to match the new warm-editorial brand (terracotta
  `primary`, `ink`/`cream`/`line`/`muted`/`danger`/`admin` tokens, `font-serif` Newsreader headings,
  no gradients/shadows/hover-scale/emoji) as part of the broader redesign started on
  `tailwind.config.js`/`src/styles.scss`/header/footer/wish-list/product-card. In
  `src/pages/contact/contact.component.html`: replaced the purple/pink glass-blur hero, decorative
  floating blobs and SVG waves with a plain `font-serif` heading + muted subtitle, restyled the GitHub
  "contribute" link and the message form (labels, inputs, select, textarea, submit button) with the
  hairline-border/rounded-xl recipe, and added `[class.border-danger]` bindings so invalid/touched
  fields get a red border (validation logic itself untouched). In
  `src/pages/contact-list/contact-list.component.html` (admin inbox): added the
  "● Modo administrador" eyebrow + serif heading, and a hairline-bordered white wrapper card around
  the table. That page's grid is rendered by `<sau-table>`, which comes from the external
  `@some-angular-utils/table` npm package (`TableModule`, see
  `src/pages/contact/contact-list/contact-list.component.ts`) — it is **not** a local component, so
  its internal markup (header row, type pills, pagination, row actions) could not be restyled from
  this repo; only the page chrome around it was updated, and the `[url]`/`[headers]`/`contentList`/
  `pageParamName`/etc. bindings were left untouched.
- 2026-09-13 — Continued the brand reskin (new warm editorial theme replacing the old purple/pink
  gradient look) on the remaining pages after the lead redid the foundations (`tailwind.config.js`,
  `styles.scss`, header/footer/wish-list/card). Restyled the dashboard landing page's hero, "Popular
  Products", and CTA sections to `bg-cream`/`bg-cream-alt` alternating backgrounds, `font-serif`
  headings, primary-color eyebrow labels, and the standard primary/outline/dark button recipes;
  removed all gradient blobs, `shadow-*`, `hover:scale-*`, and decorative emoji
  (`src/pages/dashboard/dashboard.component.html`). Recolored the global loading spinner from
  purple/pink to `border-line`/`border-t-primary-500`/`border-t-ink`, removed its gradient badge and
  emoji, and switched its text to `font-serif`/`text-ink`/`text-muted`
  (`src/components/loading/loading.component.html`). Verified `page-logged.component.html` had no
  leftover background classes needing a change. Restyled the profile page's template only (reactive
  form logic, validators, and control names untouched): the previously ad-hoc layout (plain
  `bg-gray-50`/white sections, numbered blue/orange/green circular badges) is now one bordered
  `rounded-xl` card split into three numbered sections in the new pattern (small serif `01`/`02`/`03`
  numeral in `text-primary-500` + `font-serif` title + muted description, on a `bg-cream-alt` header
  strip) — "Información básica" (username/name/surname/email + a `bg-cream-alt` measurements
  sub-panel), "Seguridad" (password-change toggle + revealed password fields in the same sub-panel
  style), and "Lista de deseos principal" (the wish-list `<select>`) — plus a `bg-cream-alt` footer
  action row (solid terracotta "Guardar cambios" / outline "Cancelar"). Field errors switched from
  red/pink Tailwind classes to `border-danger`/`text-danger-text`; success/error banners now use the
  existing `reserved-*` / `danger-*` palette instead of emerald/red; all decorative emoji removed
  (`src/pages/profile/profile.component.html`).
- 2026-09-13 — Reskinned the Steam/Amazon browse pages and embeddable widgets to match the
  already-restyled product card's flat neutral look (template-only; no `.ts`/binding changes). In
  `src/pages/steam/steam.component.html` and `src/pages/amazon/amazon.component.html`: the back-to-list
  link and the "mostrar/ocultar reservas" toggle both became plain bordered pills (`border border-line
  rounded-lg bg-white text-muted-dark hover:border-ink hover:text-ink`), replacing the old
  hover-background/translate-arrow link and the purple filled pill button. In
  `src/components/steam/steam.component.html` and `src/components/amazon/amazon.component.html`: the
  "Steam"/"Amazon" source-link header and glassy `bg-white/70 backdrop-blur` refresh button were
  restyled the same way, with the header row gaining a `border-b border-line` divider; loading skeleton
  placeholders switched from `bg-gray-200`/`shadow-sm` to `bg-swatch`/no-shadow; and the `showMore`
  "Ver más" link-card lost its `hover:scale-[1.02]` + translucent-color-tinted-icon treatment in favor
  of a plain `border-line-card` bordered card with a `chevron-right` icon, matching the product card's
  shape. Left the `md:grid-cols-{{itemsPerRow}}` interpolated grid, all `<app-card>` bindings, and
  Steam/Amazon fetch/reserve logic untouched.
- 2026-09-13 — **Full brand redesign**, replacing the original purple/pink gradient look app-wide with
  a warm editorial style imported from a Claude Design project ("Rediseño profesional de listas de
  deseos", `claude.ai/design/p/4ffff05c-5795-47cc-ae2a-c88c9f373895`, file `Lista de Deseos.dc.html`)
  via the `claude_design`/`DesignSync` MCP tool. This entry covers the foundational/shared-component
  pieces (the four contact/dashboard/steam-amazon/profile entries above cover the page-level follow-up
  work done in parallel the same day): rewrote `tailwind.config.js` (new named color tokens — see
  "Global brand style" above — replacing the `primary`/`secondary`/`accent`/`success`/`warning`/
  `error`/`neutral` scales and all `gradient-*`/`glow-*`/decorative-animation config, which were
  unused outside the deleted purple theme; kept only the `scaleadd` keyframe, which
  `wish-list.component.html` still uses), `src/styles.scss` (swapped the Inter/Poppins Google Fonts
  import for Newsreader/Karla, new `body` background/color, pruned dead unused utility classes —
  `.btn*`, `.card`, `.form-input`/`.form-label`, `.error-field`, `.text-gradient-*`, several unused
  animations — that templates never actually referenced, kept `.glass-enhanced` as a class name but
  redefined it to a plain bordered cream panel since 4 templates already used that class), and
  `src/index.html` (body background/font classes). Rewrote `src/enum/theme.ts`'s per-theme
  `classes`/`heroClasses`/`pageBackgroundClasses` to the new palette (see "Wish list themes" above) —
  helper method signatures unchanged, so `wish-list.component.ts` needed no changes. Restyled
  `src/pages/wish-list/wish-list.component.html` (hero, measurement pills, date/countdown block, "Mis
  Listas" admin switcher, product grid header/empty-state, Steam/Amazon linked-source panels, floating
  share button) and `src/components/card/card.component.html` (product card: flat bordered style,
  ink "index" badge, reserved heart/check button, `font-serif` price, plain bordered
  Comprar/edit/delete action row replacing the old per-store gradient hover-dropdown) — also deleted
  `card.component.ts`'s now-unused `getClasses`/`getDropdownClasses` methods (they baked
  Steam=blue/Amazon=orange gradient Tailwind strings; the new design uses plain neutral buttons for
  every store). Restyled `src/components/header/header.component.html` (avatar-initial circle, flat
  active-link pill, ink solid CTA, admin-tokens dropdown section) and
  `src/components/footer/footer.component.html`. Also caught and fixed
  `src/components/user-form/user-form.component.html` (the admin "edit user" modal, missed by the
  page-level agents' file lists) — same label/input recipe as every other form, decorative emoji
  removed. A parallel pass (not separately logged before this entry) also reskinned
  `src/pages/login/login.component.html`, `src/pages/register/register.component.html`,
  `src/pages/verify/verify.component.html` (previously an off-brand dark `bg-gray-800` page, now
  matches login/register), and `src/components/socialNetworkAccess/socialNetworkAccess.component.html`
  (Google button chrome only) — card/input/error-banner recipes as described in "Global brand style",
  plus the auth pages' decorative SVG wave footer gradient `<stop>` colors swapped from purple/pink to
  cream/terracotta. A second parallel pass reskinned the shared modal system:
  `src/components/customModal/customModal.component.html` (the shell every modal wraps — flat
  `bg-ink/40` overlay, `bg-cream-alt` panel, white header/footer bars, kept its pre-existing
  `max-w-{{maxWidth}}` dynamic-class mechanism untouched), `src/components/product-form/` and
  `src/components/wishlist-form/` (including converting the wish-list theme picker from a plain
  `<select>` to a radio-button pill grid using `formControlName="theme"` shared across hidden
  `sr-only` radios — same `theme` control/value semantics as the old `<select>`, no `.ts` changes — so
  each pill can show its own `event-*` accent-colored dot; also flattened the Steam/Amazon integration
  boxes from gradient icon-tiles to plain bordered cards), and
  `src/components/customDelete/customDelete.component.html` (recolored only — its raw
  `<i class="fa-solid">` icon was left as-is since that component's `.ts` doesn't import
  `FontAwesomeModule`; note its confirm/cancel buttons still come from `CustomModalComponent`'s shared
  header/footer, which always renders "Cancelar"/"Aceptar" — a fully bespoke delete-modal layout would
  need a new `@Input` on `CustomModalComponent`, not done here). Verified via repo-wide grep that no
  `purple`/`pink`/`bg-gradient-to`/`hover:scale`/decorative-`shadow-lg` classes or decorative emoji
  remain in any `.html`/`.ts` file under `src/` (the admin `contact-list.component.html`'s `<sau-table>`
  grid is the one exception, per its own changelog entry above — it's an external package component).
- 2026-09-13 — Closed the `<sau-table>` styling gap noted above by reading
  `node_modules/@some-angular-utils/table/README.md`: the package exposes theming via CSS custom
  properties scoped under a `.sau-table` class (`--sau-color-primary`, `--sau-color-secondary`,
  `--sau-color-background`, `--sau-color-edit`, `--sau-color-delete`, `--sau-color-text`) and, as of
  0.1.6, `#editButton`/`#deleteButton` `<ng-template let-item>` content-projection slots for fully
  custom action-button markup (both components already had `encapsulation: ViewEncapsulation.None` set,
  which is what makes the `.sau-table` CSS override in their `.scss` files take effect on the
  library's internal DOM). Bumped `@some-angular-utils/table` from `0.1.5` → `0.1.6` in `package.json`
  — checked-in-range latest is `0.1.29`, but every version from `0.1.7` onward requires
  `@angular/core`/`@angular/common` `^21.0.0` while this app is on Angular `20.3.31`, so `0.1.6` is the
  newest version actually installable here (confirmed via `npm view @some-angular-utils/table@<v>
  peerDependencies` across the version range); do not blindly `npm install @some-angular-utils/table@latest`
  in the future without re-checking this constraint or completing an Angular 21 upgrade first.

  **First attempt at the `--sau-color-*` override had no visible effect** — the library sets these same
  variables' defaults directly on its own `.sau-table{...}` rule inside its Emulated-encapsulation
  component style, which compiles to `.sau-table[_ngcontent-xxx]{...}`; that attribute-selector bumps
  its specificity above a plain external `.sau-table{...}` rule regardless of stylesheet load order, so
  the library's own purple defaults always won. Fixed by adding `!important` to every `--sau-color-*`
  declaration in both override files, which finally takes effect (verified by screenshotting
  `/contact/list` and `/user` with a Playwright script that pre-seeds `localStorage.currentUser` so
  `AuthGuard`/`isAdmin` pass without a live backend). Also set `--sau-color-secondary` equal to
  `--sau-color-primary` (both `#9A4A28` terracotta) rather than ink: the library paints its header row
  and active-pagination pill as a hardcoded `linear-gradient(to right, primary, secondary)`, and since
  this redesign has no gradients anywhere else, making the two variables equal collapses that gradient
  to a flat terracotta bar — the intended use of `secondary` per the README's own default
  (`--sau-color-secondary: var(--sau-color-primary)`). Final palette in both
  `src/pages/contact/contact-list/contact-list.component.scss` and `src/pages/user/user.component.scss`
  (both previously empty): `primary`/`secondary`→terracotta `#9A4A28`, `background`→white, `edit`→ink
  `#232019`, `delete`→danger `#8E2C22`, `text`→ink. Added a `#deleteButton` template to
  `contact-list.component.html`'s
  `<sau-table>` and `#editButton`/`#deleteButton` templates to `user.component.html`'s (per the
  README's undocumented-elsewhere pattern: no manual `(click)` binding needed, the library wires the
  projected button to its own `editEvent`/`deleteEvent` outputs), both styled as the same small bordered
  pill (`border-line`, hover `border-ink`/`border-danger`) used for row actions everywhere else in this
  redesign. Verified `ng build` still succeeds after the bump.
- 2026-09-13 — Fixed a real regression from the redesign: `wish-list.component.html`'s new "Productos"
  count badge read `{{wishlist.products.length}}`, but `wishlist` starts as `[]` (not yet loaded) until
  the API responds, so `wishlist.products` is `undefined` and `.length` on it threw immediately,
  crashing the whole `/list` page render for every user regardless of backend state. Fixed to
  `{{wishlist.products?.length ?? 0}}`. Verified end-to-end against the real local Laravel backend
  (`C:\Users\ADMINISTRATOR\listadedeseos\listadedeseos-laravel`, `php artisan serve`) by logging in as
  the seeded `admin` user and confirming `/list` renders correctly with live data.
- 2026-09-13 — Fixed the Steam/Amazon widgets' product grid never actually being responsive: both
  `src/components/steam/steam.component.html` and `src/components/amazon/amazon.component.html` used
  `class="grid gap-2 grid-cols-3 md:grid-cols-{{itemsPerRow}}"`, but Tailwind generates CSS only for
  class names that appear literally in source files — a runtime-interpolated string like
  `md:grid-cols-{{itemsPerRow}}` never does, so that class was silently absent from the compiled CSS
  and the grid was stuck at 3 columns on every screen size (this was flagged as a "pre-existing
  fragility" during the redesign pass but left alone at the time since it wasn't in scope; now fixed
  since it surfaced as a real usability request). Replaced with a `.responsive-grid` class defined in
  each component's (previously empty) `.scss` file using plain CSS + a `--items-per-row` custom
  property bound via `[style.--items-per-row]="itemsPerRow"`: 2 columns by default, 3 columns from
  640px, and `itemsPerRow` columns (still fully dynamic, not hardcoded) from 768px — matching the
  app's existing 2/4/6-style breakpoint convention used elsewhere (e.g. the wish-list product grid).
  Verified by screenshotting `/list/:uuid/steam` at 375/700/1024/1440px and confirming 2/3/6 columns
  respectively (itemsPerRow=6 default on that standalone page).
- 2026-09-13 — Added the app's real logo mark, imported from a Claude Design project ("Diseño logo
  Listadedeseos.es", `claude.ai/design/p/fa68d04f-b200-4995-9d58-ca2dc6e6d629`, file
  `Logo listadedeseos.dc.html`) via the `claude_design`/`DesignSync` MCP tool. That project explores
  many logo directions; per explicit instruction only the primary "sello circular" (circular seal) mark
  was implemented — a solid burgundy circle with a 4-pointed champagne/gold star/spark ("el destello del
  deseo") — using its favicon/avatar variant (no separate ring stroke, since a thin ring gets lost at
  small sizes). This mark keeps its own fixed brand-identity colors rather than the app's terracotta/ink
  UI palette (logos conventionally carry their own signature colors independent of surrounding UI
  chrome). Added `colors.logo.seal` (`#6B1F35`) / `colors.logo.spark` (`#C6A664`) to
  `tailwind.config.js` (used via `fill-logo-seal`/`fill-logo-spark` on inline `<svg>` markup) plus a
  `twinkle` keyframe/animation (scale 1→1.18 + slight rotate + opacity dip, 1.8s ease-in-out infinite)
  for animating the star. Replaced `public/assets/icon/logo.svg` (previously an unrelated hand-drawn
  pencil/heart/sparkles illustration from an older design pass) with this mark — it's referenced as both
  the browser favicon (`src/index.html`) and the header/footer `<img>` logo, so both updated
  automatically; also updated the header's `onerror` fallback (shown only if the image fails to load)
  from a plain "L"-in-a-circle to an inline `<svg>` of the same mark, and replaced the footer's
  "L"-in-a-circle placeholder with the actual `<img src="/assets/icon/logo.svg">` for consistency.
  Redesigned `src/components/loading/loading.component.html` (the full-screen loading overlay used by
  login/verify/profile/the three modal forms) around the same mark: static burgundy circle, the
  champagne star given the `animate-twinkle` class (with `transform-box:fill-box` so it scales/rotates
  from the star's own center, not the SVG viewport's corner) — replacing the previous abstract
  dual-ring spinner + bouncing dots. Verified visually (dashboard header/footer, and the login page's
  loading overlay triggered by stalling the `/api/login` request in a Playwright test) — no console
  errors, `ng build` succeeds.
- 2026-09-13 — Switched the logo mark from its original burgundy/champagne colors to
  `colors.logo.seal: '#232019'` (the app's `ink` tone) for the circle. The star ("spark") was set to
  white first, then changed on disk to `#9A4A28` (the app's `primary-500` terracotta) — kept as the
  final choice and synced into `colors.logo.spark` in `tailwind.config.js` to match
  `public/assets/icon/logo.svg` (raw SVG files can't reference Tailwind tokens, so its fill hexes are
  hardcoded and must be kept in sync manually with this token by hand). The header/loading markup
  needed no changes since they already reference the `fill-logo-seal`/`fill-logo-spark` classes rather
  than hardcoded colors.
- 2026-09-13 — Added a ring around the logo mark's disc (per feedback + a couple of live on-disk color
  swaps while iterating): the mark is now a 3-layer SVG — outer disc `fill-logo-seal` (ink `#232019`),
  a `stroke-white` ring at `r="45" stroke-width="4"` sitting just inside the disc's edge (so it isn't
  clipped by the `r="50"` outer circle reaching the viewBox boundary), and the terracotta
  `fill-logo-spark` star on top — in `public/assets/icon/logo.svg`,
  `src/components/header/header.component.html`'s image-load fallback, and
  `src/components/loading/loading.component.html`. Verified visually via a dev-server screenshot of
  the header.
