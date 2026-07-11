# WhoOwnsIt — Frontend Style Guide

Visual identity is a **light, friendly palette** — not a dark fintech/terminal theme.
Layout structure (cards, tabbed sections, pill breadcrumbs, big price display, slider
calculator) is inspired by the team's Figma template, but colors always come from the
palette below, never from the template.

## Palette (locked — see `src/colors.js`)

| Name | Hex | Role |
|---|---|---|
| Willow Green | `#B7D37F` | secondary green accent |
| Muted Olive | `#95B355` | primary accent — buttons, links, gains |
| Mint Cream | `#ECF3F1` | page background |
| Thistle | `#D5B7C6` | secondary accent — highlighted pill, chips |
| Tea Green | `#D3E5AF` | subtle fills — pill background, dividers |

Two functional colors are **not** part of the brand palette but are needed for the app
to work, and are derived to harmonize with it:

- `--foreground` (`#1f2a20`) / `--muted-foreground` (`#5c6b5e`) — body text, since the
  palette has no neutral dark tone.
- `--loss` (`#c97b7b`) — a soft red for negative returns, paired against `--gain`
  (Muted Olive). The palette has no red; this is the one addition, kept muted to fit
  the rest of the palette.

All of these are defined as CSS variables in `src/index.css` — components should
reference the variables/classes, never hardcode hex values.

## Shared classes (`src/index.css`)

- `.card` — white surface, rounded corners, subtle border/shadow, centered ~640px max
  width. Used for every content block (scan panel, result sections, etc.).
- `.primary` — primary button (Muted Olive fill, dark text), with `:hover` and
  `:disabled` states.
- `.pill` — rounded breadcrumb/chip badge (Tea Green fill). `.pill.pill-final`
  highlights the ultimate parent in an ownership chain (Thistle fill).
- `.gain` / `.loss` — green/red text for DCA profit and chart trend, always paired
  (never color alone conveys meaning — pair with a `+`/`-` sign or arrow).
- `.disclaimer` — small muted text for the DCA legal note.
- `input[type="range"]` — sliders tinted with `--primary`.

## Layout

- Centered single column, `~640px` max width on desktop, full-bleed with 1rem padding
  on mobile (< 480px) — no separate mobile layout file, the same components reflow.
- Generous spacing (`gap: 1rem` inside cards, `2rem` page padding) — should read as
  intentionally designed, not default HTML.
- Sans-serif throughout (`Inter` stack). No monospace/terminal typography.
