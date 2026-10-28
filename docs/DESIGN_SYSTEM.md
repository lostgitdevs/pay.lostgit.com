# LostGit Pay — Design System Specification
## "Precision, Visibility, Control"

**Document Version:** 1.0.0  
**Product:** `pay.lostgit.com`  
**Brand Family:** LostGit Solutions  

---

## 1. Design Philosophy

LostGit Pay is an enterprise-grade financial infrastructure and telemetry console built for LostGit Solutions. It combines client invoicing, recurring UPI AutoPay subscriptions, website analytics, and remote project entitlement management.

The design language embodies three guiding principles:
1. **Precision**: High data density, tabular numerals for monetary figures, zero ambiguous status states, and strict mathematical alignment.
2. **Visibility**: Real-time integration health, streaming analytics, immediate feedback for webhook events, and clear telemetry breakdowns.
3. **Control**: Cryptographically backed entitlement switches, audit trails for every operation, non-destructive defaults with mandatory confirmations for critical service changes.

---

## 2. Color System & Semantic Tokens

### 2.1 Base Palette (Hex & OKLCH Reference)

```css
/* Core Brand Tokens */
--color-midnight-ink: #111318;
--color-electric-violet: #6D5EF5;
--color-violet-hover: #5B4CE0;
--color-violet-tint: #F0EEFF;
--color-cloud-grey: #F5F6FA;
--color-surface-grey: #ECEEF3;
--color-border-grey: #E2E5EC;
--color-pure-white: #FFFFFF;

/* Typography Colors (Light) */
--color-text-primary: #171923;
--color-text-secondary: #667085;
--color-text-muted: #98A2B3;

/* Typography Colors (Dark) */
--color-dark-text-primary: #F4F5F8;
--color-dark-text-secondary: #A5ADBA;
--color-dark-text-muted: #6C7689;

/* Semantic Functional Colors */
--color-success: #16A36A;
--color-success-bg: #EAF8F0;
--color-warning: #E59B25;
--color-warning-bg: #FFF5DF;
--color-danger: #D64545;
--color-danger-bg: #FDECEC;
--color-info: #2878D0;
--color-info-bg: #EAF3FF;
```

### 2.2 Surface Elevation Model

| Level | Light Mode Surface | Dark Mode Surface | Typical Usage |
| :--- | :--- | :--- | :--- |
| **Canvas (L0)** | `#FFFFFF` | `#0D0F14` | Viewport background |
| **Sidebar (L1)** | `#111318` (Dark Command Shell) | `#111318` | Persistent navigation rail |
| **Card (L2)** | `#F5F6FA` (`--surface-1`) | `#171A22` | Metric cards, tables, dashboard widgets |
| **Raised (L3)** | `#ECEEF3` (`--surface-2`) | `#1D212B` | Hover states, active table rows, sub-panels |
| **Floating (L4)** | `#FFFFFF` (with shadow) | `#2A2F3B` | Modals, dropdowns, popovers, tooltips |

---

## 3. Typography & Numerical Formatting

### 3.1 Font Family Hierarchy
- **Display & Headings**: `Geist`, `Inter`, -apple-system, sans-serif
- **Body & UI**: `Inter`, system-ui, sans-serif with OpenType features (`cv02`, `cv03`, `cv04`, `cv11`)
- **Code & Monospace**: `JetBrains Mono`, `ui-monospace`, monospace

### 3.2 Type Scale
- **H1 / Page Title**: 30px (Desktop), 24px (Mobile), font-weight 700, line-height 1.15, letter-spacing -0.025em
- **H2 / Section Title**: 20px, font-weight 600, line-height 1.3, letter-spacing -0.02em
- **H3 / Card Header**: 15px, font-weight 600, line-height 1.4, letter-spacing -0.01em
- **Body Regular**: 14px, font-weight 400, line-height 1.5
- **Body Semibold**: 14px, font-weight 600, line-height 1.5
- **Caption / Meta**: 12px, font-weight 500, line-height 1.4, text-secondary
- **Micro Badge**: 11px, font-weight 600, uppercase, letter-spacing 0.08em

### 3.3 Strict Tabular Numeral Rule
All monetary figures (INR paise formatted into rupees), percentages, timestamps, session counters, and invoice IDs **must** include the CSS utility:
```css
font-variant-numeric: tabular-nums;
/* or Tailwind class: tabular-nums */
```

---

## 4. Component Design Patterns

### 4.1 Buttons
- **Primary Action**: Electric Violet background (`#6D5EF5`), white text, 8px radius or pill (`rounded-full`), subtle violet shadow (`shadow-md shadow-violet-500/20`). Hover: `#5B4CE0`.
- **Secondary / Ghost**: Transparent background with hairline border (`border-border`), text-primary, hover: surface-2.
- **Destructive**: Danger Red background (`#D64545`), white text. Used only in confirmation modals.
- **Disabled**: Opacity 0.45, cursor-not-allowed, pointer-events-none.

### 4.2 Status Badges
Status badges must never rely on color alone. They combine an SVG icon or glyph with standard text:
- **Paid / Active / Healthy**: Green dot + text on green-tinted background (`text-emerald-500 bg-emerald-500/10 border-emerald-500/20`).
- **Pending / Grace Period**: Amber clock icon + text on amber-tinted background (`text-amber-500 bg-amber-500/10 border-amber-500/20`).
- **Overdue / Suspended / Failed**: Red alert triangle + text on red-tinted background (`text-rose-500 bg-rose-500/10 border-rose-500/20`).
- **Draft / Inactive**: Slate/muted dot + text (`text-slate-400 bg-slate-400/10 border-slate-400/20`).

### 4.3 Metric Cards (KPIs)
- **Title**: 12px uppercase or 13px medium, secondary text, optional info tooltip.
- **Value**: 28px–32px bold, tabular numerals.
- **Comparison / Trend**: Real historical trend indicator (e.g., `+12.4% vs last 30d` or `-3.1%`), green if positive, red if negative, neutral if flat.
- **Loading Skeleton**: Height-matched shimmering block.

### 4.4 Data Tables
- Sticky header with subtle hairline bottom border.
- Alternating subtle row backgrounds on hover.
- Right-aligned monetary and numeric values.
- Action column with accessible dropdown or explicit action buttons.
- Integrated pagination controls with items-per-page selector.

---

## 5. Interaction & Motion Rules

1. **Duration**: Fast micro-transitions: 150ms (`ease-out`) for hover, 200ms (`ease-in-out`) for dialogs/drawers.
2. **Reduced Motion**: Respects `@media (prefers-reduced-motion: reduce)`. Transforms and scaling are disabled when requested.
3. **Focus States**: High-contrast 2px focus ring with 2px offset (`ring-2 ring-violet-500 ring-offset-2`).
