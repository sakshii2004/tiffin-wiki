# UI-SKILLS — Standardized UI/UX Design System

This document is the single source of truth for the visual language of **tiffin.wiki**.
Every new screen, component, or feature **must** follow these rules. The aesthetic is
modern, clean, and minimalist: approachable, modular, and highly legible, with generous
whitespace, high-contrast text, and soft, rounded geometry.

> Design tokens live in [app/globals.css](app/globals.css). Reusable primitives live in
> [components/ui/](components/ui). Prefer the shared primitives over ad-hoc markup.

---

## 1. Color Palette

Use **only** these core colors. Do not introduce new primary colors.

| Role | Hex | Token / Utility |
| --- | --- | --- |
| Base background (warm cream canvas) | `#fffdf7` | `--color-cream` → `bg-cream`, `text-cream` |
| Primary text & dark elements (near-black) | `#111111` | `--color-body` → `text-body`, `bg-body` |
| Primary accent / action (leafy green) | `#6aa337` | `--color-brand-peridot` → `bg-brand-peridot`, `text-brand-peridot`, `border-brand-peridot` |
| Secondary accent / highlight (deep muted red) | `#6e2020` | `--color-brand-maroon` → `bg-brand-maroon`, `text-brand-maroon` |

Usage guidance:

- **Cream (`#fffdf7`)** is the page canvas (`<body>`). White cards float on top of it.
- **Body (`#111111`)** is for headings, high-contrast text, and dark UI.
- **Peridot green (`#6aa337`)** is for primary CTAs, success/active states, and key
  interactive accents. On a green fill, use **white text** for contrast.
- **Maroon (`#6e2020`)** is for secondary/destructive actions, warnings, and distinct
  emphasis (e.g. the Button `danger` variant).
- Neutral grays (`gray-300`, `gray-500`, `gray-600`) remain available for borders, hints,
  and muted copy. Card borders use a hairline `border-black/5`.

> **Accessibility:** never use `text-brand-peridot` for small body copy or form labels —
> the contrast against cream/white fails WCAG AA. Use `text-body` or `text-gray-700`.
> Reserve green for fills, large display numbers, and accents.

---

## 2. Typography

- **Font family:** `Inter` (loaded via `next/font/google` in [app/layout.tsx](app/layout.tsx),
  exposed as `--font-inter`), falling back to `Poppins` then the system sans stack
  (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).
- **Strict rule:** **never** use "Cookie" or any cursive/handwritten/script fonts anywhere.
  Keep typography strictly geometric, clean, and professional.
- **Headings:** bold and heavily weighted (`font-bold` / weight `700`, `line-height: 1.2`)
  for clear hierarchy. Global `h1–h6` rules in `globals.css` enforce this.
- **Body:** clean with `line-height: 1.6` for high legibility on the cream background.

---

## 3. Component Geometry & Architecture

### Buttons — pill-shaped
- Always **`rounded-full`** (pill). Use the shared [`Button`](components/ui/Button.tsx)
  primitive (`primary | secondary | ghost | danger | whatsapp`, sizes `sm | md | lg`).
- Clear hover states: slight opacity drop **and** a soft shadow increase.
- Filled buttons carry `shadow-[var(--shadow-soft)]` and lift to
  `shadow-[var(--shadow-soft-lg)]` on hover.
- Maintain a **44×44px** minimum touch target.
- Ad-hoc buttons (file inputs, pagination, search submit) also use `rounded-full`.

### Cards & containers — soft rounding
- Modular content containers use **`rounded-2xl`** (16px) corners.
- White surface (`bg-white`) so cards float against the cream canvas.
- Hairline border `border-black/5` + soft shadow `shadow-[var(--shadow-soft)]`
  (interactive cards lift to `shadow-[var(--shadow-soft-lg)]` on hover).

### Inputs & form fields
- Soft `rounded-xl` corners (see `FIELD_BASE` / `TEXTAREA_BASE` in
  [components/ui/styles.ts](components/ui/styles.ts)).
- Always pair with a visible `<label>` — never placeholder-only.
- Errors render in `role="alert"` and link via `aria-describedby`.

### Shadows & depth
- Use the soft, subtle tokens defined in `globals.css`:
  - `--shadow-soft` — resting elevation for cards.
  - `--shadow-soft-lg` — hover / raised elevation.
- **Avoid** harsh, dark shadows. Depth should feel like a gentle float.

### Spacing & whitespace
- Be generous. The UI must never feel cluttered or cramped.
- Use flexbox/grid with ample `gap`, and roomy section padding
  (e.g. `py-16`, `md:py-24` for hero/marketing sections, `p-4`–`p-6` inside cards).

### Focus states (accessibility)
- Never remove focus rings. Use the shared `FOCUS_RING` / `FOCUS_RING_OFFSET`
  helpers: `focus-visible:ring-2 focus-visible:ring-brand-peridot
  focus-visible:ring-offset-2`.

---

## 4. Quick Reference (copy/paste)

```tsx
// Primary action
<Button variant="primary" size="lg">List it for free</Button>

// Secondary / destructive
<Button variant="danger">Reject</Button>      // maroon fill, white text

// Floating card
<div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
  …
</div>

// Pill button (ad-hoc)
<button className="rounded-full bg-brand-peridot px-6 py-2 font-semibold text-white
  shadow-[var(--shadow-soft)] transition-all hover:opacity-90 hover:shadow-[var(--shadow-soft-lg)]">
  Find Tiffin
</button>
```

---

## 5. Do / Don't

| Do | Don't |
| --- | --- |
| Use the cream `#fffdf7` canvas with white floating cards | Use pure-white page backgrounds everywhere |
| Make every button `rounded-full` (pill) | Use `rounded-md` / square buttons |
| Use `rounded-2xl` cards with soft shadows | Use harsh/dark drop shadows |
| Use white text on green fills | Use dark text on green (low contrast) |
| Keep typography geometric (Inter/Poppins/system) | Use Cookie or any cursive/script font |
| Reserve green for fills & accents | Use `text-brand-peridot` for small body copy |
| Use generous padding & gaps | Let the layout feel cramped |
