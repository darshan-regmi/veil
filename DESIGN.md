---
version: 1
name: Veil-design-system
description: Veil is a personal poetry reading app with a Modern Editorial identity — pure white canvas, true-black ink, a single saffron accent (#C84B31) used sparingly, and LibreBaskerville serif throughout. Cards are quiet and confident: bold serif title, a 32px saffron rule beneath it, italic preview, hairline divider, restrained "Read" CTA. The feel is closer to Substack or The Atlantic than a generic note-taking app.

colors:
  bg: "#FFFFFF"
  surface: "#FAFAF9"
  surfaceElevated: "#F4F4F2"
  ink: "#0A0A0A"
  inkSecondary: "#3F3F3F"
  meta: "#6B6B6B"
  metaLight: "#9A9A9A"
  hairline: "#E5E5E5"
  accent: "#C84B31"
  accentSoft: "#FBE9E4"
  success: "#0F8C56"
  error: "#B83A2A"
  overlay: "rgba(10,10,10,0.55)"
  ripple: "rgba(10,10,10,0.06)"
  white: "#FFFFFF"

typography:
  wordmark:
    fontFamily: LibreBaskerville-Bold
    fontSize: 28px
    fontWeight: "700"
    letterSpacing: -0.5
    color: "{colors.ink}"
  screen-eyebrow:
    fontFamily: LibreBaskerville-Italic
    fontSize: 13px
    fontWeight: "400"
    color: "{colors.meta}"
  card-title:
    fontFamily: LibreBaskerville-Bold
    fontSize: 22px
    fontWeight: "700"
    lineHeight: 28
    letterSpacing: -0.3
    color: "{colors.ink}"
  card-preview:
    fontFamily: LibreBaskerville-Italic
    fontSize: 15px
    fontWeight: "400"
    lineHeight: 24
    color: "{colors.inkSecondary}"
  card-meta:
    fontFamily: LibreBaskerville-Regular
    fontSize: 13px
    fontWeight: "400"
    color: "{colors.meta}"
  card-cta:
    fontFamily: LibreBaskerville-Bold
    fontSize: 13px
    fontWeight: "700"
    letterSpacing: 0.5
    textTransform: uppercase
    color: "{colors.ink}"
  poem-title:
    fontFamily: LibreBaskerville-Bold
    fontSize: 36px
    fontWeight: "700"
    lineHeight: 44
    letterSpacing: -0.6
    color: "{colors.ink}"
  poem-body:
    fontFamily: LibreBaskerville-Regular
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 30
    color: "{colors.inkSecondary}"
  section-heading:
    fontFamily: LibreBaskerville-Bold
    fontSize: 22px
    fontWeight: "700"
    color: "{colors.ink}"
  body-md:
    fontFamily: LibreBaskerville-Regular
    fontSize: 15px
    fontWeight: "400"
    lineHeight: 24
    color: "{colors.inkSecondary}"
  search-input:
    fontFamily: LibreBaskerville-Regular
    fontSize: 16px
    fontWeight: "400"
    color: "{colors.ink}"
  micro:
    fontFamily: LibreBaskerville-Regular
    fontSize: 11px
    fontWeight: "400"
    letterSpacing: 0.8
    textTransform: uppercase
    color: "{colors.meta}"

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 24px
  3xl: 32px
  4xl: 48px

rounded:
  sm: 6px
  md: 10px
  lg: 14px
  xl: 20px
  full: 9999px

components:
  note-card:
    backgroundColor: "{colors.surface}"
    borderRadius: "{rounded.lg}"
    borderWidth: 1
    borderColor: "{colors.hairline}"
    padding: "{spacing.2xl}"
    marginBottom: "{spacing.md}"
    title: "{typography.card-title}"
    rule:
      width: 32px
      height: 2px
      backgroundColor: "{colors.accent}"
      marginTop: 10px
      marginBottom: 14px
    meta: "{typography.card-meta}"
    preview: "{typography.card-preview}"
    divider:
      height: 1px
      backgroundColor: "{colors.hairline}"
      marginTop: "{spacing.lg}"
      marginBottom: "{spacing.md}"
    cta: "{typography.card-cta}"
  search-header:
    backgroundColor: transparent
    borderBottomWidth: 1
    borderBottomColor: "{colors.hairline}"
    borderBottomColor-focused: "{colors.accent}"
    paddingVertical: "{spacing.md}"
    paddingHorizontal: 0
    marginHorizontal: "{spacing.xl}"
    iconSize: 18
  pill:
    backgroundColor-rest: transparent
    backgroundColor-active: "{colors.ink}"
    textColor-rest: "{colors.ink}"
    textColor-active: "{colors.white}"
    borderWidth-rest: 1
    borderColor-rest: "{colors.hairline}"
    borderRadius: "{rounded.full}"
    paddingHorizontal: 14px
    paddingVertical: 6px
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    borderRadius: "{rounded.md}"
    paddingHorizontal: "{spacing.xl}"
    paddingVertical: 14px
  button-saffron:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    borderRadius: "{rounded.md}"
  fab-pill:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    borderRadius: "{rounded.full}"
    paddingHorizontal: 16px
    paddingVertical: 10px
  reading-settings-sheet:
    backgroundColor: "{colors.bg}"
    borderTopLeftRadius: "{rounded.xl}"
    borderTopRightRadius: "{rounded.xl}"
    paddingHorizontal: "{spacing.2xl}"
    paddingTop: "{spacing.2xl}"
  poem-progress-bar:
    height: 2px
    backgroundColor: "{colors.accent}"
    position: top-of-screen
---

## Overview

Veil is a focused reading app for one writer's poetry — an editorial publication you carry in your pocket. The aesthetic is deliberately quiet: white page, black ink, a single saffron accent that never crowds the type. Everything serves the text.

**Key characteristics:**
- Single typeface: **LibreBaskerville** (Regular, Italic, Bold) across every surface
- True-white background `#FFFFFF` — no warm tints
- True-black ink `#0A0A0A` — high contrast for serif rendering
- One accent: **saffron `#C84B31`** — only on rules, focus states, "Most Read" markers
- No shadows on cards by default — borders + hairlines only
- Cards are restrained: title → saffron rule → meta → italic preview → hairline → restrained CTA
- All bold text uses `fontWeight: "700"` (no Platform conditionals)
- `LibreBaskerville` is the only family — no sans-serif anywhere

## Colors

All tokens live in `constants/theme.ts` → `COLORS`. Never define local color objects.

| Token | Hex | Role |
|---|---|---|
| `bg` | `#FFFFFF` | Page / app background |
| `surface` | `#FAFAF9` | Card, search field, stat panel fills |
| `surfaceElevated` | `#F4F4F2` | Nested surfaces, sheets when stacked |
| `ink` | `#0A0A0A` | Primary text, wordmark, primary buttons |
| `inkSecondary` | `#3F3F3F` | Body text, poem content |
| `meta` | `#6B6B6B` | Dates, captions, secondary labels |
| `metaLight` | `#9A9A9A` | Placeholder, disabled |
| `hairline` | `#E5E5E5` | 1px borders, dividers, rules |
| `accent` | `#C84B31` | Saffron — small rules, focus borders, active pill, progress bar |
| `accentSoft` | `#FBE9E4` | Saffron tint background (favorited indicator, badges) |
| `success` | `#0F8C56` | Confirmation toasts |
| `error` | `#B83A2A` | Errors, retry buttons |
| `overlay` | `rgba(10,10,10,0.55)` | Modal backdrop |
| `ripple` | `rgba(10,10,10,0.06)` | Android ripple |

### Don't
- Don't put `accent` on large surfaces — it must remain rare to remain meaningful
- Don't use any warm-beige tones — the old `#FAF7F0` and `#E8E2D5` are gone
- Don't introduce shadows on cards — Modern Editorial reads as flat type on hairlines

## Typography

### Font Family
**LibreBaskerville** — Regular, Italic, Bold. Loaded once in `app/_layout.tsx`. Access via `FONTS` from `constants/theme.ts`:

```ts
import { FONTS } from "@/constants/theme";
// FONTS.regular / FONTS.italic / FONTS.bold
```

### Font Weight Rule
**Always `"700"` for bold.** Never `Platform.OS === "android" ? "700" : "600"`.

### Type Scale

| Token | Family | Size | LH | Tracking | Use |
|---|---|---|---|---|---|
| `wordmark` | Bold | 28 | — | -0.5 | "Veil" in headers |
| `card-title` | Bold | 22 | 28 | -0.3 | NoteCard title |
| `card-preview` | Italic | 15 | 24 | 0 | NoteCard preview |
| `card-meta` | Regular | 13 | — | 0 | Date · words · reading time |
| `card-cta` | Bold | 13 | — | 0.5 | "READ" — uppercase |
| `poem-title` | Bold | 36 | 44 | -0.6 | Full poem title |
| `poem-body` | Regular | 18 | 30 | 0 | Full poem content (user-adjustable) |
| `section-heading` | Bold | 22 | — | 0 | Sidebar section headings |
| `body-md` | Regular | 15 | 24 | 0 | Bio, social links |
| `search-input` | Regular | 16 | — | 0 | Search field |
| `micro` | Regular | 11 | — | 0.8 | Uppercase stat labels |

## Layout & Spacing

Token scale (`SPACING` from theme):

| Token | px | Use |
|---|---|---|
| `xs` | 4 | Tight inline gaps |
| `sm` | 8 | Icon-to-text |
| `md` | 12 | Compact gaps |
| `lg` | 16 | Default spacing |
| `xl` | 20 | Screen horizontal padding |
| `2xl` | 24 | Card padding, section gaps |
| `3xl` | 32 | Major section spacing |
| `4xl` | 48 | Hero spacing |

## Radius

`RADIUS` from theme:

| Token | px | Use |
|---|---|---|
| `sm` | 6 | Small chips, badges |
| `md` | 10 | Primary buttons, inputs |
| `lg` | 14 | Cards |
| `xl` | 20 | Bottom sheets |
| `full` | 999 | Pills, FABs |

## Elevation

`SHADOWS` from theme:

| Level | Use |
|---|---|
| (none) | Default cards — borders + hairlines only |
| `card` | Subtle lift for special cards (rarely used) |
| `elevated` | Reading settings sheet, action sheet |
| `modal` | Sidebar, full-screen modals |

## Components

### NoteCard
```
bg              surface
borderRadius    14
borderWidth     1   borderColor hairline
padding         24
marginBottom    12
shadow          none
```
Internal layout:
1. **Title** — `card-title`, ink
2. **Accent rule** — 32×2px saffron, marginTop 10, marginBottom 14
3. **Meta** — `card-meta` — `Yesterday · 42 words · 1 min`
4. **Preview** — `card-preview` italic, 3 lines max, marginTop 14
5. **Divider** — 1px hairline, marginTop 20, marginBottom 12
6. **Footer** — bookmark icon on left (filled saffron if favorited, hairline-outline if not), `READ` `card-cta` on right

### SearchHeader
Minimal. No pill. Just:
- `⌕` icon + 16pt regular input
- Bottom border: 1px hairline (rest) → 2px saffron (focused)
- No background fill
- Clear button (`×`) on right when value present

### Pill / Filter
Used for CollectionPills:
- Rest: transparent bg + 1px hairline + ink text
- Active: ink bg + white text
- Radius: full

### Reading Settings Sheet
- Bottom sheet, 20px top radius, bg = bg
- Three controls: font size stepper (Aa−/Aa+), line height segmented (Compact/Standard/Relaxed), reader-mode toggle
- Saffron when active

### Poem progress bar
- 2px saffron line at top of poem detail screen, fills from 0–100% as user scrolls

### Scroll-to-top
- Minimal black pill — `bg: ink`, `text: white`, radius full, `↑ TOP` micro caps

## Do's and Don'ts

### Do
- Use `accent` (saffron) **sparingly** — rules under titles, focus states, the bookmark fill, the progress bar, the active pill. Nothing else.
- Use hairlines (`#E5E5E5`) for all dividers, borders, rules
- Use `"700"` for bold text on both platforms
- Use `RADIUS.lg` (14) for cards, `RADIUS.md` (10) for buttons/inputs, `RADIUS.full` for pills
- Keep cards flat — no shadows by default

### Don't
- Don't tint backgrounds warm (no beige, no cream, no sepia)
- Don't put saffron on large fills (only narrow strokes / small icons)
- Don't use `Platform.OS === "android" ? "700" : "600"`
- Don't define local `COLORS` or `FONTS` objects in components
- Don't add a second typeface — LibreBaskerville does everything

## Iteration Guide

1. Update `constants/theme.ts` first for any new token, then this file
2. Reference tokens, never hardcoded hex
3. One component per file in `components/`
4. Prefer borders + hairlines over shadows
5. The accent is rare on purpose — if you're reaching for it more than once per screen, reconsider
