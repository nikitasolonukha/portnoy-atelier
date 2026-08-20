# Portnoy Atelier — Design System V2

## Visual Direction

**Feeling:** Закрытая цифровая система премиального ателье. Zegna создала внутреннее iPad-приложение для консультанта в бутике.

**DNA:** quiet luxury + Italian tailoring + editorial fashion + professional workspace

**Anti-patterns:** SaaS CRM, shadcn demo, bootstrap admin, AI dashboard, fintech, generic beige template.

---

## Visual Audit — Current Problems

### Dashboard
- KPI cards look like generic SaaS metrics boxes — bordered rectangles with icons
- Two-column "Recent Configs / New Fabrics" is standard admin template composition
- "Новая конфигурация" CTA is too loud and SaaS-like
- No visual rhythm — everything is same-weight boxes

**Fix (Loro Piana + Zegna):** Single horizontal metrics strip with hairline dividers. Editorial list for configs. Large material swatches for fabrics. Generous whitespace.

### Catalog
- Cards have article badges that look like dev labels
- Filter row is 5 identical boxes in a line — CRM aesthetics
- No image ratio control — swatches feel like database thumbnails
- Name/price/metadata compete visually

**Fix (Brunello Cucinelli):** Remove card chrome. Large 4:5 swatches. Article as small uppercase. Metadata quiet below image. Filters as minimal text controls.

### Configurator
- CSS suit mannequin is the biggest quality problem — looks like a prototype
- Right panel feels like a form, not a tailoring experience
- Options are bordered boxes with radio-button aesthetics

**Fix (Suitsupply):** Replace mannequin with fabric-filled preview stage. Visual option cards. Step-based navigation with clear progress.

### Sidebar
- Dark admin panel with highlighted rectangles
- "Демо-база активна" looks technical
- Brand mark is too small and generic

**Fix (Zegna):** Narrower, calmer, more architectural. Thin burgundy active indicator instead of background highlight. Brand as boutique identity.

### Topbar
- "Рабочее пространство ателье" with hamburger and avatar — standard admin
- Too much border-box chrome

**Fix:** Almost invisible. Just context + navigation trigger + user.

### Fabric Detail
- Specs wrapped in heavy bordered sections
- Photo/swatch takes only ~50% width

**Fix (Loro Piana PDP):** 60/40 split. Definition list with hairline separators. Price as hero element.

### Forms (Create/Edit/Import)
- One big white box with many inputs
- Upload area is standard dashed rectangle

**Fix (Aesop):** Semantic sections. Understated labels. Thin borders. Premium upload zone.

---

## Design Tokens V2

### Canvas
| Token | Value | Usage |
|---|---|---|
| `--canvas` | `#F5F2EB` | Main page background (warm limestone) |
| `--canvas-elevated` | `#FDFBF7` | Cards, inputs, elevated surfaces |
| `--canvas-deep` | `#EBE7DE` | Subtle section backgrounds |
| `--canvas-wash` | `#F9F7F2` | Hover states on canvas |

### Ink
| Token | Value | Usage |
|---|---|---|
| `--ink` | `#1A1C19` | Primary text (deep charcoal, not pure black) |
| `--ink-secondary` | `#6B6860` | Secondary text, metadata |
| `--ink-tertiary` | `#9B978E` | Hints, timestamps, disabled |
| `--ink-inverse` | `#F5F2EB` | Text on dark backgrounds |

### Accent
| Token | Value | Usage |
|---|---|---|
| `--accent` | `#762130` | Primary CTA, selected states, active markers |
| `--accent-hover` | `#5E1724` | Hover on accent elements |
| `--accent-subtle` | `#F0E4E6` | Very subtle accent background |
| `--accent-text` | `#8B2639` | Accent as text color (eyebrows, links) |

### Surface
| Token | Value | Usage |
|---|---|---|
| `--surface-dark` | `#1D1F1B` | Sidebar background |
| `--surface-dark-hover` | `#272A25` | Sidebar hover states |
| `--surface-dark-active` | `#2E312C` | Sidebar active states |

### Border
| Token | Value | Usage |
|---|---|---|
| `--border` | `rgba(26, 28, 25, 0.12)` | Default hairline borders |
| `--border-strong` | `rgba(26, 28, 25, 0.22)` | Input borders, dividers |
| `--border-accent` | `#762130` | Selected state borders |

### Focus
| Token | Value | Usage |
|---|---|---|
| `--focus-ring` | `rgba(139, 38, 57, 0.45)` | Focus outline |

### Semantic
| Token | Value | Usage |
|---|---|---|
| `--success` | `#3D5A44` | Success states |
| `--error` | `#8B2435` | Error states |

---

## Typography

### Font Stack
- **Display:** `"Cormorant Garamond", Georgia, "Times New Roman", serif` — elegant fashion serif
- **Body:** `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` — clean professional grotesk

### Scale
| Role | Font | Size | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| Display XL | Cormorant | 48–56px | 300 (light) | -0.03em | Page titles |
| Display L | Cormorant | 32–40px | 400 | -0.02em | Section titles |
| Display M | Cormorant | 24–28px | 400 | -0.015em | Card titles, subsections |
| Overline | Inter | 10–11px | 600 | 0.14em | Category labels, uppercase |
| Body L | Inter | 15px | 400 | 0 | Primary content |
| Body M | Inter | 13px | 400 | 0.005em | Secondary content, metadata |
| Body S | Inter | 11px | 500 | 0.01em | Timestamps, hints |
| UI | Inter | 13–14px | 600 | 0.01em | Buttons, navigation, controls |

---

## Spacing

Base unit: 4px

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Minimal gaps |
| `--space-2` | 8px | Tight internal padding |
| `--space-3` | 12px | Default gap |
| `--space-4` | 16px | Standard padding |
| `--space-5` | 24px | Section padding |
| `--space-6` | 32px | Large section gaps |
| `--space-8` | 48px | Page section separation |
| `--space-10` | 64px | Major visual breaks |
| `--space-12` | 80px | Hero spacing |

---

## Border Radius

| Context | Value |
|---|---|
| Default surfaces | 0px (sharp, tailored) |
| Inputs | 2px |
| Buttons | 2px |
| Interactive overlays (dropdown, modal) | 4px |
| Avatar | 50% |

No rounded-xl/2xl anywhere.

---

## Shadows

Almost none. Architecture is flat with hairline borders.

| Context | Value |
|---|---|
| Sidebar mobile overlay | `16px 0 48px rgba(0,0,0,0.15)` |
| Dropdown/modal | `0 4px 24px rgba(0,0,0,0.08)` |
| Everything else | none |

---

## Components

### Buttons
- **Primary:** `--accent` bg, white text, 44px height, 2px radius, `font-size: 13px`, `font-weight: 600`, `letter-spacing: 0.02em`
- **Secondary:** transparent bg, `--border-strong` border, ink text
- **Quiet:** no border, ink text, padding-inline 10px
- **Destructive:** transparent bg, error border, error text

### Inputs
- Height: 46px
- Border: 1px `--border-strong`
- Background: `--canvas-elevated`
- Border-radius: 2px
- Focus: 2px accent ring

### Surface
- No visible border by default
- When needed: 1px `--border` hairline
- Background: `--canvas-elevated` or transparent

---

## Animation

Motion library. Very restrained.

| Animation | Duration | Easing |
|---|---|---|
| Content fade-in | 150ms | ease-out |
| Sidebar slide | 200ms | ease |
| Dropdown open | 120ms | ease-out |
| Filter transition | 150ms | ease |
| Image hover scale | 300ms | ease-out |
| Step transition (configurator) | 200ms | ease |

No bounce, glow, float, stagger, or scroll-jacking.

---

## Reference Attribution

| Element | Source | What we take |
|---|---|---|
| Overall atmosphere, canvas, spacing | **Loro Piana** | Whitespace discipline, calm composition, warm neutrals |
| Dashboard statistics, brand feeling | **Zegna** | Typography scale, premium feeling, dark/light contrast |
| Fabric catalog grid | **Brunello Cucinelli** | No card chrome, image-first, restrained metadata |
| Configurator layout, option cards | **Suitsupply** | Preview-centric, visual options, step navigation |
| Forms, functional controls | **Aesop** | Warm surfaces, hairline separators, understated controls |
| Grid structure, editorial rhythm | **Adam Lippes / Refero** | Flush layouts, cream canvas, hairline rules |

All implementations are original Portnoy Atelier design. No brand assets copied.
