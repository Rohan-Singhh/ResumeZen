# ResumeZen design system — "Ink & Paper"

ResumeZen reads a resume the way an editor reads a manuscript. The interface is
built from that one idea:

- **Ink** — a warm, near-black studio. Every app surface.
- **Paper** — the resume itself, and the one thing in a view that should be
  looked at first (the featured plan, the primary button).
- **The red pen** — a single vermilion accent. It always means *a mark on your
  resume*: the seal, an underline, a flagged line. It is never decoration.

If a new screen follows those three rules it will look like it belongs.

## Tokens

All raw values live in [`tailwind.config.js`](tailwind.config.js). Components
reference roles, never hues.

### Color

| Role | Class | Use |
| --- | --- | --- |
| Page | `bg-surface-void` | The ground everything sits on |
| Well | `bg-surface-sunken` | Inputs, drop zones, inset tracks |
| Card | `bg-surface` | Default surface |
| Raised | `bg-surface-raised` | Dialogs, selected rows, hover |
| Overlay | `bg-surface-overlay` | Toasts, tooltips, floating bars |
| Hairline | `border-line` / `border-line-strong` | Dividers, card edges / emphasis |
| Text | `text-ink` / `-muted` / `-faint` | Primary / secondary / tertiary |
| Paper | `bg-paper`, `text-paper-ink`, `text-paper-muted` | Sheets and paper surfaces |
| Mark | `text-primary`, `bg-primary` (+ `-light`, `-dark`) | The red pen and the seal |
| Status | `good` (jade) · `warn` (ochre) · `bad` (soft red) | Scores, risk, errors |

Scores are colored by one rule everywhere — `scoreTone()` in
[`Enso.jsx`](src/components/graphics/Enso.jsx): 70+ good, 40–69 warn, below 40 bad.

### Type

Three families, loaded in [`index.html`](index.html):

- **Fraunces** (`font-display`) — headings and large numerals. Light weights,
  tight tracking. Emphasis is an italic word (`.t-em`), not a gradient.
- **Geist** (`font-sans`) — interface and body.
- **Geist Mono** (`font-mono`) — labels, timestamps, counts.
- *Caveat* (`font-hand`) — red-pen notes inside illustrations only.

Use the scale classes from [`index.css`](src/index.css) rather than ad-hoc sizes:

| Class | For |
| --- | --- |
| `.t-display` | One per page: the hero line |
| `.t-h1` / `.t-h2` / `.t-h3` | Section, panel-group and dialog headings |
| `.t-num` | Scores, prices, big counts (tabular) |
| `.t-title` | Card and panel titles inside the app |
| `.t-lead` / `.t-body` / `.t-small` | Running text |
| `.t-label` | Mono uppercase eyebrows and column labels |
| `.t-meta` | Mono timestamps, sizes, counts |

### Shape, depth, motion

- **Radius** — controls `rounded-md` (8) · cards `rounded-lg` (12) · panels and
  dialogs `rounded-xl` (16) · feature blocks `rounded-2xl` (24) · paper
  `rounded-sheet` (3). Chips use `rounded`; pills `rounded-full`.
- **Elevation** — `shadow-e1` (cards) · `shadow-e2` (popovers) · `shadow-e3`
  (dialogs, floating bars) · `shadow-sheet` (paper). On a dark UI depth is a lit
  top edge plus a tight shadow, not a glow.
- **Spacing** — Tailwind's 4px scale. Page gutters and width come from `.shell`;
  section rhythm from `.section`. Cards pad `p-5 sm:p-6`.
- **Motion** — presets in [`utils/motion.js`](src/utils/motion.js): durations
  `fast` 120ms / `base` 200ms / `slow` 400ms / `page` 300ms, easings
  `out` / `standard` / `in`, springs `spring` / `springSoft` / `springGentle`,
  plus `reveal()` for scroll reveals and `stamp` for the seal. Animate
  `transform` and `opacity` only. Reduced motion is honoured globally.

## Components

Primitives in [`src/components/ui`](src/components/ui):
`Button` · `Card` · `Badge` · `Field` / `Input` / `Textarea` · `Segmented` ·
`Modal` / `ModalHeader` · `Toast` (`useToast`) · `Skeleton` · `Spinner` ·
`EmptyState` · `Avatar` · `PageHeader` · `SectionHeader` · `SectionHeading`.

Graphics in [`src/components/graphics`](src/components/graphics):

- `InkLandscape` — the atmosphere: seeded ink-wash ridges, haze and a sun.
  Pure SVG and gradients; each depth plane is its own layer so parallax is a
  compositor transform.
- `Enso` — a score as one open brush circle.
- `Seal` — a stamped verdict. One per view.
- `ResumeSheet`, `Marks`, `PaperGlyph` — the page and the red pen.

Report pieces in [`src/components/report`](src/components/report):
`ReportView` (the full report, shared by Studio and the report dialog),
`Meter`, `Sparkline`.

## Rules of thumb

1. At most one paper sheet and one seal per view. They are the focal points.
2. Vermilion marks something on the resume. For system errors use `bad`.
3. Every empty, loading and error state says what happened and what to do next
   (`EmptyState`, `Skeleton`, inline alerts). No bare spinners on full panels.
4. Dialogs are bottom sheets on phones (handled by `Modal`).
5. Give responsive grids an explicit `grid-cols-1` base so a wide child can't
   push the page sideways.
