# Portnoy Atelier — Design System V3

Source of truth for the full visual redesign (Stage 1 UI only).

## Visual thesis

**Premium technological tailoring software** — quiet luxury + editorial fashion + technical precision.

Not: beige admin panel, SaaS CRM, KPI cards, generic card chrome.

## Reference mapping

| Area | References |
|---|---|
| Global identity | ÉRRA Atelier, Maison Margiela |
| Workspace / dashboard | Art+Commerce, Zegna |
| Fabrics catalog | FARFETCH, Adam Lippes, SILKARE |
| Configurator | SuitSupply, Tailoring Atelier, MotionSites (spatial) |
| Dark surfaces | Penumbra |
| Motion | MotionSites, restrained CSS/motion |

## Tokens

### Canvas
- `--canvas`: `#F2EFE8`
- `--canvas-elevated`: `#FAF8F3`
- `--canvas-deep`: `#E8E4DB`

### Ink
- `--ink`: `#181815`
- `--ink-secondary`: `#6A6760`
- `--ink-tertiary`: `#9A968D`

### Accent (5–10% area)
- `--accent`: `#6E1F2C`
- `--accent-hover`: `#591722`

### Dark shell
- `--surface-dark`: `#171916`
- `--tech-steel`: `#8A9098` (micro-labels only)

### Borders
- `--border`: `rgba(24, 24, 21, 0.12)`
- `--border-strong`: `rgba(24, 24, 21, 0.22)`

## Typography

- **Display:** Cormorant Garamond — page titles, fabric names, editorial moments
- **UI:** Inter — nav, controls, metadata, forms
- **Micro:** 10–11px uppercase, tracking 0.14–0.2em

## Composition rules

1. **Fabric is the hero** — image/texture dominates; metadata is quiet.
2. **No card chrome** — hairlines + typography, not boxed KPI/list/grid templates.
3. **Asymmetric grids** — editorial rhythm on dashboard and catalog.
4. **Configurator = material stage** — no fake 3D/CSS mannequin; macro texture + technical line-art.
5. **Whitespace is structural** — not empty unused viewport.
6. **Motion is restrained** — 150–250ms fades, scale 1.01–1.02, line progression.

## Forbidden

- KPI card blocks
- 4 identical select boxes in a toolbar row
- rounded-2xl SaaS cards
- gradients/glow/glass for “premium”
- CSS pseudo-suit mannequin

## Pass checklist

- [x] Pass 1: tokens + app shell
- [x] Pass 2: dashboard
- [x] Pass 3: fabric catalog
- [x] Pass 4: fabric detail / create / edit
- [x] Pass 5: import
- [x] Pass 6: configurator
- [x] Pass 7: configurations + compare
- [x] Pass 8: iPad responsive
- [ ] Pass 9: visual QA + tests
