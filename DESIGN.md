---
version: 2
name: Modern-Editorial-design-system
description: A reusable design system for content-first mobile apps with an editorial sensibility — true-white canvas, true-black ink, a single saffron accent used sparingly, and a serif typeface (LibreBaskerville in Veil) for every surface. Cards are quiet and confident: bold title, a 32px saffron rule beneath it, italic preview, hairline divider, restrained uppercase CTA. The aesthetic sits closer to Substack/The Atlantic than to a generic SaaS app. Pair with a single brand accent, a serif type family, and the layered architecture (light + dark palette, dynamic stylesheets via context) and you can adapt this system to any reading-first product.

colors_light:
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
  onInk: "#FFFFFF"
  white: "#FFFFFF"

colors_dark:
  bg: "#0F0F10"
  surface: "#18181B"
  surfaceElevated: "#232327"
  ink: "#F0EDE6"
  inkSecondary: "#C5C0B8"
  meta: "#8E8985"
  metaLight: "#5C5856"
  hairline: "#2A2A2E"
  accent: "#E66B4D"
  accentSoft: "#3A1A12"
  success: "#4EBC85"
  error: "#E66B5C"
  overlay: "rgba(0,0,0,0.72)"
  ripple: "rgba(255,255,255,0.08)"
  onInk: "#0F0F10"
  white: "#FFFFFF"

typography:
  wordmark:        { family: serif-bold,   size: 28, weight: 700, tracking: -0.5,  color: ink }
  poem-title:      { family: serif-bold,   size: 36, weight: 700, lineHeight: 44, tracking: -0.6, color: ink }
  section-heading: { family: serif-bold,   size: 22, weight: 700, tracking: 0,    color: ink }
  card-title:      { family: serif-bold,   size: 22, weight: 700, lineHeight: 28, tracking: -0.3, color: ink }
  card-cta:        { family: serif-bold,   size: 13, weight: 700, tracking: 0.5,  case: upper, color: ink }
  card-meta:       { family: serif-regular,size: 13, weight: 400, color: meta }
  card-preview:    { family: serif-italic, size: 15, weight: 400, lineHeight: 24, color: inkSecondary }
  poem-body:       { family: serif-regular,size: 18, weight: 400, lineHeight: 30, color: inkSecondary }
  body-md:         { family: serif-regular,size: 15, weight: 400, lineHeight: 24, color: inkSecondary }
  search-input:    { family: serif-regular,size: 16, weight: 400, color: ink }
  eyebrow:         { family: serif-bold,   size: 11, weight: 700, tracking: 1.2,  case: upper, color: meta }
  micro:           { family: serif-regular,size: 11, weight: 400, tracking: 0.8,  case: upper, color: meta }
  caption-italic:  { family: serif-italic, size: 12, weight: 400, color: meta }

spacing:   { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24, 3xl: 32, 4xl: 48 }
radius:    { sm: 6, md: 10, lg: 14, xl: 20, full: 9999 }
strokes:   { hairline: 1, focus: 2, rule: 2 }
durations: { fast: 180, medium: 220, slow: 280, sheet: 320 }
elevation:
  flat:      none
  card:      "shadow ink @0.04 offset 0 1 radius 2 — android elevation 1"
  elevated:  "shadow ink @0.08 offset 0 4 radius 12 — android elevation 4"
  modal:     "shadow ink @0.18 offset 0 12 radius 24 — android elevation 12"

motion:
  press-scale:  { from: 1, to: 0.985, spring: friction 6 }
  card-fade-in: { duration: 260, easing: linear, useNativeDriver: true }
  focus-border: { duration: 180, easing: linear }
  sheet:        { in: 280, out: 220, easing: cubic }
  sidebar:      { in: 320, out: 240, easing: cubic }
  chrome-toggle:{ duration: 220, easing: linear }

haptics:
  navigate:     ImpactFeedbackStyle.Light
  destructive:  ImpactFeedbackStyle.Medium
  share-refresh:ImpactFeedbackStyle.Medium
  segmented:    selectionAsync
  success:      NotificationFeedbackType.Success
  error:        NotificationFeedbackType.Error
---

# Modern Editorial — design system

A serif-led, content-first design system for reading apps. Pulled from
production code in the Veil poetry app and structured so it can be lifted
into another product with minimal modification.

> **What this is for.** Apps where the content is the product — poetry, essays,
> newsletters, journals, longform reading. The system optimises for legibility
> and for a feeling of being held by an editorial hand, not for dashboard
> density or feature breadth.

> **What this is NOT for.** Data-dense dashboards, marketplaces with lots of
> imagery, gaming UI, or anything that needs more than one accent colour. If
> you need bright category chips and rainbow charts, this system will fight you.

---

## Table of contents

1. [Identity & philosophy](#1-identity--philosophy)
2. [Colour system](#2-colour-system)
3. [Typography](#3-typography)
4. [Spacing & layout](#4-spacing--layout)
5. [Shape & radius](#5-shape--radius)
6. [Elevation](#6-elevation)
7. [Iconography](#7-iconography)
8. [Components](#8-components)
9. [Motion](#9-motion)
10. [Interaction & haptics](#10-interaction--haptics)
11. [Theme system architecture](#11-theme-system-architecture)
12. [File & code structure](#12-file--code-structure)
13. [Do's and don'ts](#13-dos-and-donts)
14. [Adapting this to a new app](#14-adapting-this-to-a-new-app)

---

## 1. Identity & philosophy

### The three rules

1. **Type does the heavy lifting.** A bold serif title with a thin accent rule
   beneath it is the single most repeated motif. Pages have headlines, not
   chrome.
2. **One accent. Use it sparingly.** The saffron accent appears under titles,
   as the focus border on inputs, as the active-pill fill, as the bookmark fill,
   and as the top progress bar in a poem. Nothing else. The moment you put it
   on a large surface, it stops being editorial and starts being a brand
   campaign.
3. **Hairlines over shadows.** Most cards are flat with a 1px hairline border.
   Shadows are reserved for genuinely elevated layers (sheets, toasts, sidebar).
   This keeps the feel quiet and printed-looking.

### Brand voice in pixels

- True white (`#FFFFFF`) and true-black-ink (`#0A0A0A`). No warm tints anywhere
  on the light theme. If you want warmth, that comes from the serif, not from
  the background.
- A single saffron (`#C84B31`) for accent. It's a print colour — feels like the
  red used by old magazines for chapter rules.
- One typeface family across every surface — LibreBaskerville in Veil. Adding
  a second face dilutes the brand instantly.
- Bold uppercase micro-labels (`READ`, `CONTINUE READING`, `APPEARANCE`) at 11pt
  with 1.2 letter-spacing. These read as section eyebrows from an editorial
  layout.

### What it should feel like

When you open the app it should feel less like a "tool" and more like a small
publication that someone curated for you. The user is a reader first, an
operator second.

---

## 2. Colour system

The palette is split into a **light** and a **dark** variant. Both share the
same semantic token names; only the hex values change. Components consume
tokens (`colors.ink`), never raw hex.

### Semantic tokens

| Token | Role | Don't confuse with |
|---|---|---|
| `bg` | Page background. Where the reader's eye starts. | `surface` (cards) |
| `surface` | Card fills, search field background, stat panels | `bg` |
| `surfaceElevated` | Nested surfaces, pressed-state of icon buttons | `surface` |
| `ink` | Primary text, wordmark, primary button fill | `inkSecondary` (body) |
| `inkSecondary` | Body text, poem content | `meta` (smaller / quieter) |
| `meta` | Date stamps, captions, secondary labels | `metaLight` (placeholders) |
| `metaLight` | Placeholder, disabled, decorative icons in empty states | — |
| `hairline` | 1px borders, dividers, all rule lines | `meta` (text colour) |
| `accent` | THE saffron. Rules, focus, active pill, bookmark fill, progress | `error` (also reddish) |
| `accentSoft` | Saffron-tinted backgrounds (rare — badges) | `accent` |
| `success` | Confirmation toast icon, success-bordered toast | — |
| `error` | Error icons, retry-style buttons (not used as text colour) | `accent` |
| `overlay` | Modal backdrop scrim | — |
| `ripple` | Android pressable ripple colour | — |
| `onInk` | Text/icon colour to place ON an ink-coloured fill (button label) | `white` |
| `white` | Literal white. Used for the small white knob of a toggle. | `onInk` |

### Light palette

```
bg              #FFFFFF
surface         #FAFAF9
surfaceElevated #F4F4F2
ink             #0A0A0A
inkSecondary    #3F3F3F
meta            #6B6B6B
metaLight       #9A9A9A
hairline        #E5E5E5
accent          #C84B31
accentSoft      #FBE9E4
success         #0F8C56
error           #B83A2A
overlay         rgba(10,10,10,0.55)
ripple          rgba(10,10,10,0.06)
onInk           #FFFFFF
white           #FFFFFF
```

### Dark palette

The dark theme is **not** a simple invert. The "white" gets warmed
(`#F0EDE6`) so it stays comfortable to read at length. The "black"
backdrop is `#0F0F10` rather than `#000000` to be kinder to OLED panels
and avoid the sterile feeling of pure black. The saffron brightens
(`#E66B4D`) to keep adequate contrast against the dark backdrop.

```
bg              #0F0F10
surface         #18181B
surfaceElevated #232327
ink             #F0EDE6   ← warm off-white for reading comfort
inkSecondary    #C5C0B8
meta            #8E8985
metaLight       #5C5856
hairline        #2A2A2E
accent          #E66B4D   ← brighter saffron for dark contrast
accentSoft      #3A1A12
success         #4EBC85
error           #E66B5C
overlay         rgba(0,0,0,0.72)
ripple          rgba(255,255,255,0.08)
onInk           #0F0F10
white           #FFFFFF
```

### Accent discipline

The saffron rule is the brand. Treat it as scarce. A reasonable allowance per
screen:

- 1 saffron rule under the wordmark
- 1 saffron rule under any title (card, section)
- 1 active state (focused input, active pill)
- 1 affirmative element (filled bookmark, progress bar)

If you reach for a fifth saffron on a single screen, you are using it as
decoration instead of accent. Step back.

---

## 3. Typography

### The single-family rule

Every text element ships in **one type family** — `LibreBaskerville` in Veil.
Three faces: `Regular`, `Italic`, `Bold`. No sans-serif anywhere. This is the
single biggest visual decision in the system and it makes everything else
easier to design.

If you adopt this system for another app, replace the family but keep the
rule. Good candidates: *Cormorant*, *Source Serif Pro*, *EB Garamond*,
*Spectral*, *Cardo*, *Vollkorn*.

### Font weight rule

Bold is **always** `fontWeight: "700"` on both platforms. The legacy
`Platform.OS === "android" ? "700" : "600"` pattern is forbidden — it dates
from before reliable TTF embedding and produces inconsistent rendering today.

### Type scale

| Token | Family | Size | Line height | Tracking | Case | Use |
|---|---|---:|---:|---:|---|---|
| `wordmark` | Bold | 28 | — | -0.5 | — | App-bar word logo |
| `poem-title` | Bold | 36 | 44 | -0.6 | — | Full content title |
| `section-heading` | Bold | 22 | — | 0 | — | Settings sections |
| `card-title` | Bold | 22 | 28 | -0.3 | — | List card title |
| `card-cta` | Bold | 13 | — | 0.5 | upper | Card CTA (`READ`) |
| `card-meta` | Regular | 13 | — | 0 | — | Date · words · time |
| `card-preview` | Italic | 15 | 24 | 0 | — | List card preview |
| `poem-body` | Regular | 18 | 30* | 0 | — | Reading content |
| `body-md` | Regular | 15 | 24 | 0 | — | Bio, social links |
| `search-input` | Regular | 16 | — | 0 | — | Text input |
| `eyebrow` | Bold | 11 | — | 1.2 | upper | Section labels |
| `micro` | Regular | 11 | — | 0.8 | upper | Stat labels |
| `caption-italic` | Italic | 12 | — | 0 | — | "Last edited", offline note |

\* Poem body line-height is **user-adjustable** at runtime via the reading
settings sheet. Multiplier scale: `compact 1.4`, `standard 1.6`, `relaxed 1.85`.

### Negative tracking on display sizes

All bold display tokens use slightly negative letter-spacing (`-0.3` to `-0.6`).
This is essential for serif headlines — without it they look loose and dated.

### Italic for atmosphere

Italic is used for **content snippets** (card previews) and **soft labels**
("Last edited", offline banner). Never for emphasis inside body copy.

---

## 4. Spacing & layout

### Scale

| Token | Value | Common use |
|---|---:|---|
| `xs` | 4 | Tight inline gaps, icon-to-text within a row |
| `sm` | 8 | Icon-to-text in compact UI |
| `md` | 12 | Compact group gaps, card vertical rhythm |
| `lg` | 16 | Default block spacing |
| `xl` | 20 | Screen horizontal padding |
| `2xl` | 24 | Card padding, section gap inside sheet |
| `3xl` | 32 | Major section spacing, poem meta → body |
| `4xl` | 48 | Hero / empty-state breathing |

### Layout rules

- **Screen horizontal padding: 20** (`xl`). Cards inherit it via their own
  horizontal margin so that horizontally-scrolling rows (pill filters,
  "Continue Reading") can break out to the edge.
- **Card padding: 24** (`2xl`). Less and the type doesn't have room to breathe.
- **Poem content padding: 24** with the body kept narrow by the screen itself —
  no max-width override needed on mobile.

---

## 5. Shape & radius

| Token | px | Use |
|---|---:|---|
| `sm` | 6 | Small chips, badges, icon-button corners |
| `md` | 10 | Primary buttons, text inputs, segmented controls |
| `lg` | 14 | Cards |
| `xl` | 20 | Bottom sheets (top corners only) |
| `full` | 9999 | Pills (filter chips, scroll-to-top, the small FAB-ish circles) |

### Geometric philosophy

Radii are **modest**. Cards at 14 — not 20. Buttons at 10 — not 16. The
softness comes from typography and whitespace, not from rounded corners.
Pill shapes (`full`) are reserved for tiny interactive elements where the
shape itself signals "tap me" — filter pills, the circular icon buttons in
the header.

---

## 6. Elevation

| Level | Treatment | Use |
|---|---|---|
| `flat` | No shadow. 1px hairline border. | **Default**. All cards. |
| `card` | iOS: `shadow ink @0.04 offset 0 1 radius 2` · Android: `elevation 1` | Rare. Use when a card needs to feel slightly lifted from its row. |
| `elevated` | iOS: `shadow ink @0.08 offset 0 4 radius 12` · Android: `elevation 4` | Reading settings sheet, toast. |
| `modal` | iOS: `shadow ink @0.18 offset 0 12 radius 24` · Android: `elevation 12` | Sidebar, full-screen overlays. |

The default state is **flat**. If you find yourself adding shadows to cards in
a list, ask if a hairline border would do the same job (it usually does).

---

## 7. Iconography

### Library

[`@expo/vector-icons`](https://docs.expo.dev/guides/icons/) — **Feather Icons
only**. Single icon family means a consistent stroke weight and join style
across the whole app.

### Sizes

| px | Use |
|---:|---|
| 14 | In-pill icons next to text |
| 16 | Bookmark on card, share-link arrow |
| 18 | Search field icon, sheet stepper buttons, header trailing icons |
| 20 | Poem detail header icons |
| 22 | App-bar back button, sidebar close, library bookmark button |

### Stroke weights

Default `strokeWidth: 1.5`. Emphasised states bump to `1.8` (icons inside
animated buttons). Active tab icons (when a real tab bar is visible) use
`2.0`. The slight stroke change is what subtle iconography feels like —
size changes are jumpier.

---

## 8. Components

Each component below documents: structure, the tokens it consumes, and the
key interaction details.

### 8.1 Note card (list item)

```
┌──────────────────────────────────────────┐
│  Bold serif title (22pt)                 │  ← card-title
│  ─────                                   │  ← 32×2 saffron rule
│  Yesterday · 42 words · 1 min            │  ← card-meta
│  "and the moon said, softly..."          │  ← card-preview, italic
│  ─────────────────────────────────       │  ← 1px hairline divider
│  ⃝ (bookmark)                     READ   │  ← bookmark + uppercase CTA
└──────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Background | `surface` |
| Border | 1px `hairline` |
| Radius | `lg` (14) |
| Padding | `2xl` (24) |
| Margin bottom | `md` (12) |
| Margin horizontal | `xl` (20) |
| Shadow | none |

**Press:** scale → 0.985, spring friction 6. **Long press:** action sheet with
Favorite / Copy / Share. **Animation on mount:** fade `0 → 1` over 260ms.

### 8.2 Search header

Minimal field — no fill, hairline bottom border only, no rounded box. Focus
animates the border from `hairline` (1px) to `accent` (2px) over 180ms.
Animated.Value interpolations must be **memoised against `colors`** so dark
mode picks up new endpoint values immediately.

| Property | Value |
|---|---|
| Background | transparent |
| Border-bottom (rest) | 1px `hairline` |
| Border-bottom (focused) | 2px `accent` |
| Padding | vertical `md` (12) |
| Margin | horizontal `xl` (20), top `sm`, bottom `lg` |
| Icon left | 18px Feather `search` |
| Clear (right) | 18px Feather `x`, appears only when value present |

### 8.3 Pills / filter row

```
[ All ] [ Love ] [ Nature ] [ Solitude ]
```

| State | Background | Text | Border |
|---|---|---|---|
| Rest | transparent | `ink` | 1px `hairline` |
| Active | `ink` | `onInk` | `ink` (same) |
| Pressed (rest only) | — | — | opacity 0.55 |

Padding 14×6, radius `full`. Use selection haptic on tap.

### 8.4 Buttons

#### Primary (ink-filled)

| Property | Value |
|---|---|
| Background | `ink` |
| Text colour | `onInk` |
| Type | `card-cta` (uppercase 13pt bold) |
| Radius | `md` (10) |
| Padding | horizontal `xl` (20), vertical 14 |

#### Header icon button

Circular 38×38 with hairline border. Background transparent at rest,
`surfaceElevated` when pressed. Used for shuffle, favorites entry, etc.

### 8.5 Scroll-to-top pill

A small black pill rather than a round FAB. Lower visual weight, fits the
editorial aesthetic.

| Property | Value |
|---|---|
| Background | `ink` |
| Text/icon | `onInk` |
| Label | `↑ TOP` (12pt bold, 0.8 tracking) |
| Padding | horizontal 16, vertical 10 |
| Radius | `full` |
| Shadow | `elevated` |

### 8.6 Reading settings bottom sheet

Slides up from the bottom over a `modal` overlay. Top corners rounded `xl`
(20), bg = `bg`. Contains:

- **Eyebrow** — `READING` in eyebrow style
- **Stepper** — minus / Aa preview / plus, with live size label
- **Segmented control** — Compact / Standard / Relaxed
- **Toggle row** — Reader Mode

Animation: enters 280ms cubic-out, exits 220ms cubic-in. Native modal with
backdrop fade.

### 8.7 Sidebar (slide-in)

Slides in from the left at 340px width. Drawn over the full-screen overlay
with `modal` shadow. Inside: profile block, reading stats (week/streak/total
in three thin columns with hairline borders), **APPEARANCE** segmented
control (Auto/Light/Dark), BIO with saffron drop-cap, CONNECT social links.

Sticky footer with a single primary button (`BACK TO LIBRARY`).

### 8.8 Toast

A bordered alert that animates in from the top under the status bar.

| Property | Value |
|---|---|
| Background | `bg` |
| Border | 1px `hairline` |
| Radius | `md` |
| Padding | horizontal `lg`, vertical `md` |
| Shadow | `elevated` |
| Icon | 16px Feather `check` in `success` (success toast) |
| Text | regular 14pt `ink` |
| Animation | spring slide-in 9 friction + 180ms opacity |
| Auto-dismiss | 2500ms |

### 8.9 Empty state

Centered. Big metaLight icon, small saffron rule below the icon, bold title,
short body — max width 280 so the line breaks feel intentional. Three
documented variants in code: `library`, `favorites`, `offline` — each with its
own icon + copy.

### 8.10 Error view

Same composition as empty state but the icon is the `error`-coloured
`alert-circle`. A primary `TRY AGAIN` button at the bottom. No retry counter,
no detail trace — let the user re-trigger and read the actual cause from the
toast that follows.

### 8.11 Skeleton loader

Mimics the note card exactly — same radius, same border, same padding, same
internal vertical rhythm. The internal rectangles use `hairline` for fills.
Saffron rule placeholder uses real `accent` at 0.5 opacity so the skeleton
already hints at the brand. Pulse animation: loop 1 → 0.45 → 1 over 1400ms.

### 8.12 "Continue Reading" / recently-read row

Horizontal-scroll row of small cards (160×auto). Each card has a 24×2 saffron
rule on top and the title beneath. Use `Continue Reading` as the eyebrow
above the row.

### 8.13 Progress bar (poem detail)

A 2px saffron line pinned to the very top of the screen, filling from 0 →
100% as the user scrolls the body. Below the status bar on Android.

### 8.14 Adaptive icon (Android)

Foreground PNG is **transparent**; Android composites it over the
`adaptiveIcon.backgroundColor` set in `app.config.ts`. The dark adaptive
variant uses the dark-palette ink (`#F0EDE6`) for the V and the dark-palette
accent (`#E66B4D`) for the rule. The V occupies only ~34% of the canvas so
Android's mask doesn't clip it.

---

## 9. Motion

| Pattern | From | To | Duration | Easing |
|---|---|---|---:|---|
| Press feedback (card / pill) | scale 1 | scale 0.985 | spring (friction 6) | — |
| Card mount | opacity 0 | opacity 1 | 260ms | linear |
| Search focus border | hairline 1px | accent 2px | 180ms | linear |
| Bottom sheet open | translateY 400 | 0 | 280ms | cubic-out |
| Bottom sheet close | 0 | 400 | 220ms | cubic-in |
| Sidebar open | translateX −340 | 0 | 320ms | cubic-out |
| Sidebar close | 0 | −340 | 240ms | cubic-in |
| Sidebar overlay fade | 0 | 1 | 200ms | linear |
| Reader-mode chrome toggle | opacity 1 | 0 | 220ms | linear |
| Toast in | translateY −80, opacity 0 | 0, 1 | spring 9 + 180ms | — |
| Skeleton pulse | opacity 1 ↔ 0.45 | — | 700ms each leg | linear |

### Native driver discipline

Every animation that doesn't touch a layout property uses
`useNativeDriver: true`. Border colour animations (the search field focus)
must use `useNativeDriver: false` because colour isn't supported on the
native side. Interpolations that depend on theme tokens must be wrapped in
`useMemo(() => anim.interpolate(...), [anim, colors.x, colors.y])` so they
re-create when the palette flips.

---

## 10. Interaction & haptics

Every meaningful tap triggers a haptic on iOS/Android (skip on web).
The intensity ladder:

| Action | Haptic |
|---|---|
| Tapping a card to navigate | Light impact |
| Tapping back / opening sidebar | Light impact |
| Scroll-to-top, refresh, random poem | Medium impact |
| Toggling favorite | Light impact |
| Stepper or segmented selection | Selection (`Haptics.selectionAsync`) |
| Reader Mode toggle | Light impact |
| Copy succeeded | Success notification |
| Network error caught | Error notification |

### Press feedback

Cards and large pressables use a scale-down to 0.985 with a soft spring
(friction 6, native driver). It must be subtle — anything stronger feels
unprofessional on a content-focused app.

### Pressed-state colours

Smaller pressables that don't scale (icon buttons, segmented controls) use
either `opacity 0.5` for transparent backgrounds or `surfaceElevated` as a
pressed-state fill. Never use the accent for pressed states.

---

## 11. Theme system architecture

### The contract

```ts
// contexts/ThemeContext.tsx
useTheme(): {
  scheme:    "system" | "light" | "dark";  // user choice
  effective: "light" | "dark";             // actually rendered
  colors:    ThemeColors;                  // the palette
  setScheme: (s) => void;                  // user picker
}
```

Three layers:

1. **Two palettes** exported as `LIGHT_COLORS` and `DARK_COLORS` from
   `constants/theme.ts`, both satisfying the same `ThemeColors` interface.
2. **A provider** (`ThemeProvider`) that owns:
   - The user's `scheme` choice, persisted to AsyncStorage
   - The current `systemScheme`, subscribed to `Appearance.addChangeListener`
   - Resolved `effective` theme and the active `colors` reference
3. **A consumer hook** (`useTheme()`) used in every screen and component.

### The `makeStyles(colors)` pattern

StyleSheets capture values at module load time, so a static `StyleSheet.create`
can't react to theme changes. Instead, every styled component does:

```ts
function MyComp() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return <View style={styles.container} />;
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { backgroundColor: colors.bg },
});
```

`useMemo` recomputes only when the `colors` reference changes — which only
happens on a theme flip. Performance is effectively identical to a static
StyleSheet during steady-state.

### Status bar

`barStyle` is derived from `effective`:

```ts
<StatusBar barStyle={effective === "dark" ? "light-content" : "dark-content"} />
```

The root layout's `expo-status-bar` uses `style={effective === "dark" ? "light" : "dark"}`.

### Persisted user choice

```ts
const KEY = "myapp.theme.v1";
AsyncStorage.setItem(KEY, scheme);
```

Always namespace under your app name and version the key so palette overhauls
can ignore old saved values.

---

## 12. File & code structure

```
constants/
  theme.ts                   // LIGHT_COLORS, DARK_COLORS, ThemeColors, SPACING, RADIUS, SHADOWS, FONTS, TIMING, ...
contexts/
  ThemeContext.tsx           // Theme provider + useTheme
  FavoritesContext.tsx       // Cross-screen shared state pattern (see §13 on contexts vs hooks)
  ReadingSettingsContext.tsx // Font size, line height, reader mode
hooks/
  useFavorites.ts            // Thin re-export of context (back-compat surface)
  useReadingHistory.ts       // Wraps a util module + adds derived stats
  useReadingSettings.ts      // Re-export
  useDebounce.ts             // Generic
components/
  NoteCard.tsx, SearchHeader.tsx, AboutSidebar.tsx, ReadingSettingsSheet.tsx,
  EmptyState.tsx, ErrorView.tsx, SkeletonLoader.tsx, SuccessToast.tsx,
  ScrollToTopButton.tsx, CollectionPills.tsx, RandomPoemButton.tsx,
  RecentlyReadRow.tsx, ShareCard.tsx
app/
  _layout.tsx                // ThemeProvider → FavoritesProvider → ReadingSettingsProvider → Stack
  (tabs)/_layout.tsx
  (tabs)/index.tsx           // Library screen
  poem/[id].tsx              // Reader screen
  favorites.tsx              // Saved items screen
  +not-found.tsx
utils/
  cache.ts                   // AsyncStorage wrapper
  favorites.ts               // AsyncStorage primitives for one feature
  readingHistory.ts          // Same pattern + computeStats()
  notion.ts                  // External API client
  storage.ts                 // Orchestrator: cache-first read, network refresh
scripts/
  build-logo.mjs             // TTF → outlined SVG → all icon PNG variants
assets/
  logo/                      // Source SVGs (outlined, font-independent)
  images/                    // Generated PNGs (icon, adaptive-icon, splash, favicon)
```

### Contexts vs hooks (the rule we learned the hard way)

If state needs to be **shared across screens** (favorites toggled in detail
must instantly update the card on the feed), it must live in a **Context
provider** mounted high in the tree. A bare `useState` hook called in two
components creates two independent stores — they silently desync.

Rule of thumb:
- Genuinely local? Hook (`useState`).
- Shared between two or more screens? Context.
- Persisted across sessions? Context + AsyncStorage in the provider.

---

## 13. Do's and don'ts

### Do

- ✅ Read every colour from `useTheme()`. Never `import { COLORS } from "..."`.
- ✅ Read every font name from `FONTS.regular / .italic / .bold`. Never inline
  the family string.
- ✅ Use `fontWeight: "700"` for bold text on both platforms.
- ✅ Use the `makeStyles(colors)` factory pattern in every component.
- ✅ Default cards to flat — borders + hairlines, no shadow.
- ✅ Use the saffron rule as the main brand mark. Keep it short (24–32px).
- ✅ Use Feather icons exclusively, with the established size + stroke scale.
- ✅ Fire a haptic on every meaningful tap (light for navigate, medium for
  destructive/refresh, selection for steppers).
- ✅ Wrap state shared between screens in a Context provider.
- ✅ Wrap any `Animated.Value.interpolate` whose outputRange uses theme colours
  in `useMemo([anim, colors.x])` so it re-creates on theme flip.

### Don't

- ❌ Don't tint backgrounds warm. No beige, no cream, no sepia.
- ❌ Don't use saffron on large surfaces. It's an accent, not a brand wash.
- ❌ Don't introduce a second typeface. Italic + Bold on the brand serif is
  already three faces; that's enough.
- ❌ Don't use `Platform.OS === "android" ? "700" : "600"`. Use `"700"`.
- ❌ Don't define local `COLORS` objects inside component files.
- ❌ Don't put `opacity: 0` on off-screen views that you intend to capture
  with `react-native-view-shot`. Capture comes back blank. Position them
  off-screen (`left: -20000`) instead.
- ❌ Don't `Share.share({ url })` on Android — Android silently drops the URL.
  Use `expo-sharing.shareAsync(uri, { mimeType })` for cross-platform image
  share.
- ❌ Don't bake your dark adaptive-icon background into the foreground PNG.
  Let Android composite a transparent foreground over `adaptiveIcon.backgroundColor`.
- ❌ Don't add shadows to flat list cards. Hairlines do the same job quieter.
- ❌ Don't put a tab bar on a single-screen app just because the framework
  template did. Hide it.

---

## 14. Adapting this to a new app

### The minimum viable swap

1. **Pick your serif.** LibreBaskerville → Cormorant / EB Garamond / Spectral.
   Update `FONTS.regular/italic/bold` and load via `expo-font` in the root
   layout. That single change re-skins everything.
2. **Pick your accent.** Update `accent` and `accentSoft` in both palettes.
   If you change the accent, also re-run the icon build script so the
   saffron rule under your wordmark updates.
3. **Pick your wordmark.** Replace the V in `scripts/build-logo.mjs` with
   your initial letter. The script reads the TTF, extracts the glyph, and
   rasterizes every icon variant.

That's it for the visual layer.

### Stuff you can probably keep as-is

- The two-palette structure and naming
- The `ThemeContext` + `makeStyles(colors)` pattern
- The spacing / radius / shadow scales
- The motion timings
- The haptic ladder
- The note card composition (title + rule + meta + italic preview + divider + CTA)
- The bottom sheet, sidebar, toast, empty/error patterns
- The search header (minimal, hairline-bottom)
- The component file structure

### Stuff that's app-specific and needs reconsidering

- **The single typeface rule.** If your content is data-dense (financial,
  scientific), you may need a paired sans-serif for tabular numbers. In
  that case, add one — but only one — and document the pairing clearly.
- **Saffron specifically.** Pick an accent that matches your category.
  Cookbook → terracotta. Meditation → forest. Coding tools → cyan. Whatever
  it is, restrict yourself to one and apply the same scarcity rule.
- **Reading-specific components.** `ReadingSettingsSheet`, `RecentlyReadRow`,
  `progress bar` — only relevant for reading apps. Drop or replace for
  other domains.

### Pre-launch checklist

- [ ] Both light and dark palettes have all 16 tokens defined
- [ ] Every component uses `useTheme()` + `makeStyles(colors)`
- [ ] No `import { COLORS }` references anywhere (search the codebase)
- [ ] No `fontWeight: Platform.OS === "android" ? ...` patterns
- [ ] No raw hex strings in component StyleSheets (except in
  `ShareCard.tsx` if you keep that pattern of "always-light" assets)
- [ ] `app.config.ts` references `EXPO_PUBLIC_*` env vars, not hardcoded
  secrets. `.env.local` is gitignored. `.env.example` documents what's
  needed.
- [ ] Status bar `barStyle` flips with `effective` theme
- [ ] `adaptiveIcon.backgroundColor` matches your dark-palette `bg`,
  foreground PNG is transparent
- [ ] Splash background matches light-palette `bg`
- [ ] All shared state lives in a Context provider, not a bare hook
- [ ] `react-native-view-shot` captures use off-screen positioning, not
  `opacity: 0`
- [ ] Share-as-image goes through `expo-sharing.shareAsync` on both
  platforms, with a sanitised `<title>.png` filename via `expo-file-system`

---

## Appendix: A note on the typographic logo

The Veil mark — a serif capital `V` with a saffron rule beneath it — is
generated from the bundled TTF by `scripts/build-logo.mjs`. It outlines the
glyph (so the SVG renders identically across machines without the font
installed) and rasterizes four variants:

- `icon.png` (1024) — standard
- `adaptive-icon.png` (1024) — Android adaptive foreground, transparent,
  dark-palette colours
- `splash-icon.png` (1024) — splash screen
- `favicon.png` (48) — web

To adapt the logo for another app: edit `build-logo.mjs`, change the
character looked up by `charToGlyph("V")`, optionally tweak `capHeight`,
`ruleWidth`, `ruleHeight`, `ruleGap`. Re-run with `node scripts/build-logo.mjs`.

The script intentionally keeps the **same composition rule** for all icons:
a single bold serif letter on top, a thin saffron rule beneath. That
composition is the visual signature of the brand — change the letter, keep
the composition.
