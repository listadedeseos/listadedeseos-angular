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

- **Angular 21**, standalone components only (no NgModules), `ChangeDetectionStrategy.OnPush` +
  manual `ChangeDetectorRef.markForCheck()/detectChanges()` — this codebase does **not** use Angular
  signals.
- **Tailwind CSS 3** for all styling (`tailwind.config.js`), utility classes written inline in
  templates. Component `.scss` files are mostly empty/unused; prefer Tailwind classes over new SCSS.
- **RxJS** for async (HTTP calls return `Observable`s from `ApiService`).
- **Font Awesome** (`@fortawesome/angular-fontawesome`) for icons, `ngx-toastr-notifier` for toasts
  (via `Utils.ToastUtils`).
- **`@some-angular-utils/modal`** (`SAUModalService`) for every modal/dialog in the app — see
  "Modal system" below.
- Karma/Jasmine for unit tests (`npm test`).
- **Package manager: bun** (`bun.lock` is the lockfile of record; there is no `package-lock.json`).
  `ng update` on this repo correctly detects and shells out to bun.

## Architecture

- **Routing** (`src/app/app.routes.ts`): a custom `UrlMatcher` (`userMatcher`) recognizes
  `@username[/wishListName]` URLs and routes them to `WishListComponent`. Everything renders inside
  `PageLoggedComponent` (header + `<router-outlet>` + footer). The outlet wrapper is full-width (no
  `max-w-*`), so each page constrains its own content (`container mx-auto` or `max-w-* mx-auto`) and
  full-bleed section backgrounds (wish-list hero, dashboard bands) span the viewport. `AuthGuard` protects private routes
  (`/list`, `/user`, `/profile`, `/contact/list`).
- **API layer** (`src/apiConnection/`): `ApiService` is a thin generic REST wrapper
  (`getPetition`/`getById`/`save`/`deleteById`). `JwtInterceptor` attaches the auth token,
  `ErrorInterceptor` handles HTTP errors, `AuthenticationService` tracks the logged-in user,
  `AuthGuard` guards routes. `Utils.urls` (`src/utils/utils.ts`) centralizes API endpoint paths.
- **Pages** (`src/pages/`): route-level components (dashboard, wish-list, login/register, profile,
  contact, steam/amazon integrations, verify email, etc).
- **Components** (`src/components/`): reusable/shared pieces (header, footer, product card, modals —
  product form, wishlist form, delete confirm, user form — steam/amazon widgets, page-logged shell).
- **Modal system**: every modal (`ProductFormComponent`, `WishlistFormComponent`,
  `CustomDeleteComponent`, `UserFormComponent`) is opened via `SAUModalService.open(Component,
  { size })` from `@some-angular-utils/modal`, not embedded in a parent's template behind an `@if`.
  The service dynamically creates the given component and appends it straight to `<body>` inside its
  own `<sau-modal>` backdrop/dialog shell (centered, Escape/backdrop-click dismiss, no host markup
  needed in the opening page) — it returns a `ModalRef` whose `.componentInstance` you set `@Input()`s
  on right after `open()`, and whose `.result` promise resolves on `modalRef.close(value)` / rejects
  on `modalRef.dismiss()`. Each modal component injects its own `ModalRef<Self>` (`inject(ModalRef)`)
  and calls `close`/`dismiss` itself instead of emitting `@Output()` events — there used to be a
  `CustomModalComponent` wrapper that rendered a shared header/footer via `<ng-content>` around a
  parent-supplied body, but `SAUModalComponent` (the library's own chrome) only provides the
  backdrop/centering/sizing, not a header or footer — so each of the 4 form components now renders its
  *own* header (`font-serif` title computed from a `modalTitle` getter, e.g. `(id?'Editar':'Nuevo') +
  ' producto'`, plus a `fa-icon` close button) and footer (`Cancelar`/`Aceptar`) inline in its own
  template, using the exact markup `CustomModalComponent` used to provide. Callers (`WishListComponent`,
  `UserComponent`, `ContactListComponent`) inject `SAUModalService` and call an `open*Modal(id?)`
  method that does `modalRef.componentInstance.x = y` then `modalRef.result.then(onConfirm, onCancel)`
  — see `src/pages/wish-list/wish-list.component.ts`'s `openProductModal`/`openWishlistModal`/
  `openDeleteProductModal` for the pattern. The library's default backdrop/dialog chrome (blur,
  rounded corners, box-shadow, 3 sizes `sm`/`md`/`lg`) is used as-is; only its 3 exposed CSS custom
  properties are reskinned to the app's brand via a global `sau-modal { --sau-color-primary;
  --sau-color-background; --sau-color-text }` block in `src/styles.scss` (needs `!important` for the
  same reason `.sau-table`'s override does — see the `@some-angular-utils/table` changelog entry
  below). `CustomModalComponent` itself was deleted (`src/components/customModal/`) since nothing uses
  it anymore.
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
│   ├── customDelete/          Generic delete-confirmation modal (opened via SAUModalService)
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
- 2026-09-13 — **Upgraded Angular 20 → 21** (`@angular/core`/`common`/`compiler`/`forms`/
  `platform-browser`/`router`/`cli`/`build`/`compiler-cli` all `^21.2.x`, `@angular/cdk` → `^21.2.14`,
  `typescript` → `^5.9.3`) via `ng update`, as a prerequisite for adding `@some-angular-utils/modal`
  (see next entry) — its only two published versions (0.0.2/0.0.3) require `@angular/core`/`common`
  `^21.0.0`, and this app was still on 20.3.31. `ng update`'s official migration schematics
  auto-converted the last remaining `*ngIf`/`*ngFor` structural directives to `@if`/`@for` block syntax
  (and dropped the now-unneeded `CommonModule` import) in `src/components/card/card.component.ts`,
  `src/components/header/header.component.ts`, `src/pages/profile/profile.component.ts`, and
  `src/pages/verify/verify.component.ts` (plus their templates) — no manual changes needed there.
  Also had to bump two more packages whose peer deps didn't yet support Angular 21:
  `@fortawesome/angular-fontawesome` `^3.0.0` → `^4.0.0` (4.0.0's only breaking change is dropping
  Angular 20 support — no API changes) and `ngx-toastr-notifier` `^20.0.9` → `^21.0.11`; the latter
  pulls in `@angular/material` as a peer dependency it uses internally (for toast rendering) that
  wasn't previously pinned in `package.json` at all — added `"@angular/material": "^21.2.14"`
  explicitly, since without it `bun install` silently resolved a stale, incompatible
  `@angular/material@20.2.14` from a prior lockfile entry (Angular does not tolerate mixed major
  versions across `@angular/*` packages at runtime). `@some-angular-utils/table` was already on
  `^0.1.29` (Angular-21-only) per its own changelog entry below, so it now correctly matches the rest
  of the app. Verified via `ng build` / `ng build --configuration=production` after each dependency
  bump.
- 2026-09-13 — **Added `@some-angular-utils/modal`** and rewired every modal in the app
  (`ProductFormComponent`, `WishlistFormComponent`, `CustomDeleteComponent`, `UserFormComponent`) to
  open through `SAUModalService.open()` instead of being embedded in a parent template behind an
  `@if(modalOpen){...}` flag — see "Modal system" under Architecture above for the full pattern.
  Deleted `src/components/customModal/` (`CustomModalComponent`), whose header/footer chrome markup
  was copied verbatim into each of the 4 form components' own templates (the library's `SAUModalComponent`
  chrome only provides backdrop/centering/sizing, not a header or footer). Rewrote the 3 pages that
  used to render `@if(...){<app-x-form (closeFunction)="..." (acceptFunction)="...">}` blocks
  (`src/pages/wish-list/wish-list.component.ts`/`.html`, `src/pages/user/user.component.ts`/`.html`,
  `src/pages/contact/contact-list/contact-list.component.ts`/`.html`) into `open*Modal(id?)` TS methods
  that call `sauModalService.open(Component, { size })`, set `@Input()`s on `modalRef.componentInstance`,
  and handle success/cancel via `modalRef.result.then(onConfirm, onCancel)` — all now-unused
  `modalXOpen`/`editingXId`/`toggleModalX` state and template blocks were removed. Sized the product/
  wishlist/user forms `size: 'lg'` (closest match to the old default `max-w-2xl`) and the delete
  confirmation `size: 'md'` (previously also defaulted to the same wide `2xl`, which was oversized for
  a 2-line confirm dialog — an intentional small improvement, not just a port). Reskinned the library's
  3 exposed CSS custom properties to the app's brand in `src/styles.scss` (`sau-modal { --sau-color-primary:
  #9A4A28; --sau-color-background: #FBF9F6; --sau-color-text: #232019 }`, all `!important` — needed for
  the same load-order-wins-the-cascade reason the `.sau-table` override needed it, see that changelog
  entry below); did not attempt to strip the library's own box-shadow/blur/rounded-corner chrome since
  those aren't exposed as overridable properties and doing so would mean fighting the library's own
  component styles rather than a documented customization point. Along the way, fixed a real (if minor)
  regression introduced mid-task and one pre-existing bug in `CustomDeleteComponent`: its header close
  button was first ported using a raw `<i class="fa-solid fa-xmark">` (mirroring the component's
  pre-existing raw-`<i>` trash-can icon), but this app has no global Font Awesome CSS/webfont loaded
  anywhere — the `fa-icon` Angular component (backed by `@fortawesome/angular-fontawesome` + SVG icon
  packs registered in `src/app/app.ts`) is the only way icons render here, which is exactly why the
  pre-existing trash-can icon was invisible too (previously left alone per a note in this file, since
  the component didn't import `FontAwesomeModule`). Fixed both: added `FontAwesomeModule` to
  `CustomDeleteComponent`'s `imports` and switched both icons to `<fa-icon>`. Verified end-to-end with
  a Playwright script against the dev server (`ng serve --port 4201`, to avoid the user's own `4200`
  session) with `localStorage.currentUser` pre-seeded and `**/api/**` routes mocked (no live backend
  needed): opened and screenshotted all 4 modals (new product, edit product with prefilled data, new
  wishlist, delete confirm), confirmed the brand CSS variables render correctly (cream-alt background,
  terracotta accept button, ink text), and confirmed dismissal via the X button, the footer Cancelar
  button, the Escape key, and a backdrop click all correctly tear the `<sau-modal>` element out of the
  DOM. `ng build` / `ng build --configuration=production` both succeed.
- 2026-10-22 — Fixes from a Playwright QA pass over the redesign (all pages at 1440px/375px with mocked
  `/api/**` and a pre-seeded `localStorage.currentUser`). The redesign's button/panel recipes used
  `px-4.5`/`p-4.5`/`gap-4.5` (modal Cancelar/Aceptar footers in all 4 modals, the product form's
  optional-fields toggle/panel, the contact form), but Tailwind 3's default scale has no `4.5` step, so
  those classes silently produced no CSS (unpadded buttons with text touching the border, uneven contact
  form spacing) — added `spacing: { '4.5': '1.125rem' }` to `tailwind.config.js` rather than rewriting
  12 call sites. Mobile polish in `wish-list.component.html`: the date-limit block's vertical dividers
  are now `hidden sm:block` (they dangled when the block stacks), "Mis listas" tiles got `px-8` +
  `break-words` so long names no longer run under the delete button, the floating share button is
  smaller/closer to the edge below `sm`, and the icon-only (below `md`) Compartir/Ajustes/Reservas/Añadir
  buttons got `aria-label`s. The header's hamburger checkbox went from `hidden` to `sr-only` (+
  `peer-focus-visible` ring on its `<label>`) so the mobile menu is keyboard-operable. Also fixed
  `WishListComponent.dateCounter` leaking a new `setInterval` per list load — the interval id is now
  stored, cleared before starting a new one and in `ngOnDestroy`. (`tailwind.config.js`,
  `src/pages/wish-list/wish-list.component.html`/`.ts`, `src/components/header/header.component.html`)
  Follow-up the same day: `PageLoggedComponent`'s outlet wrapper dropped its `max-w-7xl` cap, which was
  boxing in the wish-list hero and the dashboard's alternating background bands (they stopped short of
  the viewport edges while header/footer were full-width) — pages that relied on that cap
  (`steam`, `amazon`, `user`) now set `max-w-7xl mx-auto` themselves; the rest already used
  `container mx-auto`, which now also aligns with the header/footer's own `container` on wide screens.
  `CardComponent`: products without an image show the same `empty.webp` placeholder as broken image
  URLs (previously a text-only card), the "Comprar" button is hidden when `principalUrl` is empty, and
  prices go through a new `formattedPrice` getter — numeric values are formatted `es-ES`/EUR
  (`9,50 €`), already-formatted strings (Steam/Amazon scrapers) pass through unchanged, and empty
  prices hide the price row. (`src/components/page-logged/page-logged.component.html`,
  `src/pages/{steam,amazon,user}/*.component.html`, `src/components/card/card.component.html`/`.ts`)
- 2026-10-22 — Removed the "Beta" label from the header logo lockup (now just the serif "Lista de
  Deseos" wordmark) and the "Beta" pill next to the footer copyright.
  (`src/components/header/header.component.html`, `src/components/footer/footer.component.html`)
- 2026-10-22 — Added a "Usuario activo" checkbox (`active` form control, same checkbox recipe as the
  product form's "Producto visible") to the admin edit-user modal. It maps to the backend `user.active`
  column (checked by `JwtAuth` at login). Note: as of this change the Laravel
  `UserController@update` admin path does not persist `active` (nor `role`) — it only assigns
  name/surname/username/email/measurements/password/main_wish_list_id — so the checkbox loads the
  current value but saving it needs a matching backend change.
  (`src/components/user-form/user-form.component.html`/`.ts`)
- 2026-10-22 — Switched the CI deploy pipeline from npm to bun: `oven-sh/setup-bun@v2` (pinned to
  `1.3.4`, matching local) + `bun install --frozen-lockfile` + `bun run build:prod`. The old `npm ci`
  step could not work since the repo has no `package-lock.json` (`bun.lock` is the lockfile). Node is
  still set up (bumped 20 → 22) because the Angular CLI runs on Node; bun is the package manager and
  script runner. (`.github/workflows/pipeline.yml`)
- 2026-10-22 — Fixed the admin "Editar usuario" action (and user/contact deletion) never working:
  `<sau-table>`'s `editEvent`/`deleteEvent` emit the **whole row object** (`editEvent.emit(item)`), but
  `UserComponent.openEditModal`/`openDeleteModal` and `ContactListComponent.openDeleteModal` treated the
  payload as a numeric id, so the modals requested `user/[object Object]` (edit form stayed empty, save
  /delete hit invalid URLs). Handlers now take the row and use `item.id`. Verified with Playwright
  (mocked API): edit loads `GET user/7` + `GET wishlist/user/7`, prefills the form, saves via
  `PUT user/7` (including `active`), and delete sends `DELETE user/7` / `DELETE contact/9`. Note: the
  `#editButton`/`#deleteButton` custom templates mentioned in an earlier entry are no longer in
  `user.component.html`/`contact-list.component.html`; the library's default buttons are used.
  (`src/pages/user/user.component.ts`, `src/pages/contact/contact-list/contact-list.component.ts`)
- 2026-10-22 — Slimmed the admin users table (`/user`) from 7 columns + a nested 7-column wish-list
  sub-table down to 4: **Usuario** (avatar initial, name, `@username · email`, `#id`, Admin/Inactivo
  pills, email-verified/Google icons — replacing ID/LOGIN/NOMBRE/CORREO), **Listas** (one linked pill
  per wish list, star for main, Steam/Amazon brand icons — replacing the nested table), Actualizado,
  Opciones. Done via `<sau-table [customTemplates]="{ username: userCell, wish_lists: listsCell }">`:
  the library looks up custom cell templates by `header.key` (string keys only) and passes
  `let-item="item"`. Note the library's own admin crown only renders for a header literally named
  `'NOMBRE'`, hence the explicit Admin pill. (`src/pages/user/user.component.html`/`.ts`)
- 2026-10-22 — Fixed a "flash" when opening edit modals: the product/wishlist/user forms showed the
  full-screen `<app-loading>` overlay (blurred page + animated logo) during the ~100–300ms `getById`
  fetch (the product form even swapped the whole modal out for it), so it blinked on and off. All 3
  forms now always render the modal and show an in-modal busy overlay (`absolute inset-0`, small
  spinner) whose visibility is delayed by the new `animate-fadein-delayed` Tailwind animation
  (`fadein` 0.2s after a 0.3s delay): fast loads/saves never show it, slow ones fade it in; it still
  blocks clicks immediately. `LoadingComponent` is no longer used by the modal forms (still used by
  login/verify/profile). (`tailwind.config.js`, `src/components/{product,wishlist,user}-form/*`)
- 2026-10-22 — Users table "Listas" cell: users with more than 3 wish lists now get a "N listas ▾"
  button that opens a floating dropdown listing them in a column (≤3 still show inline pills; the pill
  markup lives in a shared `#listPill` template). The dropdown is a `@angular/cdk/overlay`
  `cdkConnectedOverlay` (transparent backdrop, closes on outside click / Escape, flips above the button
  when there's no room below), so it renders outside the table and never changes the row height. Its
  open state is keyed by the clicked `CdkOverlayOrigin`, not the user id, because `<sau-table>` renders
  every custom cell twice (desktop table + hidden mobile cards) — an id key also opened the hidden
  copy's overlay, which showed up stuck at the page's top-left corner. No CDK overlay CSS import was
  needed (CDK 21 loads its overlay structural styles itself). (`src/pages/user/user.component.html`/`.ts`)
- 2026-10-22 — Folded the users table's "Actualizado" column into the **Usuario** cell as a small third
  line ("Actualizado dd/MM/yyyy HH:mm · Creado dd/MM/yyyy", via `DatePipe`), so the table is now just
  Usuario / Listas / Opciones. (`src/pages/user/user.component.html`/`.ts`)
- 2026-10-22 — Users table, mobile cards: users with more than 3 wish lists now show **all** list pills
  (wrapped) instead of the "N listas ▾" dropdown, which stays desktop-only. Since `<sau-table>` renders
  each custom cell twice (desktop table + cards inside `.sau-table-mobile`), the two variants are
  toggled with the Tailwind arbitrary variant `[.sau-table-mobile_&]:hidden` / `[.sau-table-mobile_&]:flex`,
  which follows the library's own mobile breakpoint rather than a guessed `md:`. Also fixed the pills
  overflowing the card instead of wrapping: the library's cell wrapper `.sau-table-data-type-section`
  is a non-shrinking flex item, so `user.component.scss` (scoped via a new `.users-page` class on the
  page's `<main>`, since the component uses `ViewEncapsulation.None`) gives it `min-width: 0; flex: 1 1
  auto` inside `.sau-table-mobile` only — applying it to the desktop table too would re-center cells.
  (`src/pages/user/user.component.html`/`.scss`)
- 2026-10-22 — The wish-list form's theme ("Tema de la lista") picker, previously hidden for everyone
  behind `@if(false)`, is now shown to admins only (`isAdmin` from `AuthenticationService`). The
  `theme` control stays in the form for all users so the current theme is sent back unchanged.
  Enforced server-side too, in the separate Laravel backend
  (`C:\Users\ADMINISTRATOR\listadedeseos\listadedeseos-laravel`): `WishListController@update` (also
  used by `create`) only assigns `theme` when the JWT's `role` is `ROLE_ADMIN`; otherwise the stored
  theme is kept (null on create). (`src/components/wishlist-form/wishlist-form.component.html`/`.ts`)
- 2026-10-22 — Fixed edits made in the wish-list settings modal (theme, name, deadline, Steam/Amazon)
  not showing until a reload: `WishListComponent.wishlistUpdate` only patched the "Mis listas" card
  array, never the list being viewed (`this.wishlist` → hero badge/banner/deadline, share URL), and
  never ran change detection — the page is `OnPush` and the result arrives via the modal's
  `result` promise, not a template event. It now also merges the response into `this.wishlist` when
  the edited list is the one on screen (keeping `products`, which the API response omits), recomputes
  `urlToShare` (new private `ownerUsername`, captured in `getWishList`) and the deadline counter, and
  calls `markForCheck()`/`detectChanges()` for both new and edited lists.
  (`src/pages/wish-list/wish-list.component.ts`)
- 2026-10-22 — Backend follow-up: the admin-only `theme` check added to `WishListController@update`
  broke 4 of the Laravel feature tests (`login`, `create product`, `verify user`, `delete main wish
  list user`) with "Attempt to read property "role" on null" — `update` is also called internally from
  public, unauthenticated flows (verify/login creating the default "Principal" list), where there's no
  `user` request attribute. Switched to a null-safe read (`$request->attributes->get('user')?->role`),
  so those calls count as non-admin. `php artisan test`: 12/12 passing.
- 2026-10-22 — Username inputs in the register page and the admin edit-user modal now show a fixed,
  non-editable "@" prefix inside the field (same recipe the profile page already used: absolutely
  positioned `&#64;` span + `pl-7` on the input), so users don't type it. New
  `Utils.stripUsernameAt(control)` (`src/utils/utils.ts`) strips any leading "@" typed or pasted anyway,
  since the API validates usernames as `alpha_num`; wired into both forms. Also fixed the register
  form's `username` control being initialised to `[]` instead of `''`.
  (`src/pages/register/register.component.html`/`.ts`, `src/components/user-form/user-form.component.html`/`.ts`)
- 2026-10-22 — **Reworked suggestions (contact messages) end to end.** Users send them from
  `/contact`; admins triage them at `/contact/list`. Problems fixed: the admin inbox couldn't show the
  message text or email, there was no way to mark anything (the backend's `mark-as-done` endpoint was
  unused and one-way), it listed oldest first, messages over 255 chars broke on MySQL (`body` was
  VARCHAR(255)), and the contact form's `reset()` nulled `type` so a second submission failed
  validation (now `reset({ type: 'question' })`).
  Backend (`C:\Users\ADMINISTRATOR\listadedeseos\listadedeseos-laravel`): new migration
  `2026_10_22_000000_add_status_to_contact` adds `contact.status` (`pending` / `in_progress` / `done`
  / `discarded`, default `pending`, backfilled `done` from `is_done`) and widens `body` to TEXT on MySQL
  (raw `ALTER`, since the project has no doctrine/dbal for `->change()`); `Contact::STATUSES`;
  `GET /contact` now sorts newest first, accepts `?status=`/`?type=` filters and returns per-status
  `counts`; new admin-only `PUT /contact/{id}/status` (validated; keeps `is_done` in sync for older
  clients; `mark-as-done` also sets `status`). New `tests/Feature/ContactTest.php` (6 tests) — suite is
  18/18 green (run with `php -d "error_reporting=E_ALL & ~E_DEPRECATED" artisan test`, otherwise
  PHP 8.4 floods the output with Laravel 9 deprecation notices). **Deploying needs
  `php artisan migrate`.**
  Frontend: `ContactListComponent` rebuilt — status tabs (Todas / Pendiente / En curso / Hecha /
  Descartada, with counts; default Pendiente) that re-point the table's `[url]` to
  `contact?status=…` and call `onPageChange(1)` (sau-table doesn't reload on `[url]` changes);
  columns MENSAJE (type pill, title, full body with "Ver más" past 180 chars, sender, `mailto:` reply
  link, date) and ESTADO (colour-coded `<select>` that PUTs the new status optimistically, reverting
  on error, then refreshes counts and, under a status tab, the rows). Same mobile-card shrink fix as
  the users table, scoped via `.contact-page`. (`src/pages/contact/contact-list/*`,
  `src/pages/contact/contact.component.ts`)
- 2026-10-22 — Contact form (`/contact`, still public): when the user is logged in, the "Nombre" and
  "Correo electrónico" fields are hidden and their controls removed from the form; the backend fills
  them from the account. In the Laravel backend, `ContactController@create` now optionally checks the
  `Authorization` token (the route has no auth middleware) and, if valid, overwrites `name`
  (`name surname`, falling back to `username`) and `email` from the `User` row before validating, so
  client-sent values are ignored. Anonymous visitors still see and must fill both fields. New test
  `test_logged_user_name_and_email_come_from_account`; suite 19/19.
  (`src/pages/contact/contact.component.html`/`.ts`)
- 2026-10-22 — Renamed the `complaint` contact type's label from "Error o queja" to "Queja" in the
  contact form's select and the admin inbox's type pill.
  (`src/pages/contact/contact.component.html`, `src/pages/contact/contact-list/contact-list.component.ts`)
- 2026-10-22 — **Wish-list visit counter.** Backend (Laravel): new migration
  `2026_10_22_000001_add_views_to_wish_list` adds `wish_list.views` (unsigned int, default 0);
  `WishListController::countVisit` increments it from the two public read endpoints
  (`GET wishlist/{username}[/{name}]` and `GET wishlist/uuid/{uuid}`) unless the optional bearer token
  belongs to the list's owner. It increments via the query builder so visits don't touch `updated_at`.
  Every page load counts (no per-visitor dedupe). New `tests/Feature/WishListViewsTest.php`; suite
  20/20. **Deploying needs `php artisan migrate`.** Frontend: the owner (`isMyWishList`) sees an
  eye-icon "N visitas" pill next to the "Productos" count (owner and admins only — `isMyWishList || isAdmin`).
  (`src/pages/wish-list/wish-list.component.html`)
- 2026-10-22 — Header user dropdown (admin section): the "Lista de sugerencias" item's subtitle now
  shows "N pendientes · M en curso" (pending count highlighted in `text-danger` when > 0) instead of
  "Ver sugerencias". `HeaderComponent.loadContactCounts()` reads the `counts` field of
  `GET contact?page=1&limit=1`. It runs on load and again on `mouseenter` of the dropdown, since the
  header persists across navigations. Admins only. (`src/components/header/header.component.html`/`.ts`)
- 2026-10-24 — Admin users table (`/user`) now shows wish-list visits: each list pill in the **Listas**
  cell ends with an eye icon + that list's `views`, and the **Usuario** cell's dates line adds the
  user's total ("· N visitas", new `UserComponent.totalViews()` summing `wish_lists[].views`). No
  backend change was needed: `GET user/getAll` already returns `views` on each eager-loaded wish list.
  (`src/pages/user/user.component.html`/`.ts`)
