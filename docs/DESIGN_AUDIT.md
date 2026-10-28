# Brand Audit & Identity Specification: LostGit Solutions & LostGit Pay

**Document Version:** 1.0.0  
**Audit Date:** October 28, 2026  
**Audited Targets:**
- Primary Brand Reference: `https://www.lostgit.com/` (Live HTML & CSS verified via HTTP inspection)
- Secondary Product Reference: `https://academy.lostgit.com/` (Live HTML & CSS verified via HTTP inspection)
- Product: **LostGit Pay** (`pay.lostgit.com`)

---

## 1. Verified Brand Styles: lostgit.com & academy.lostgit.com

### 1.1 Technology & Foundation
- **Build Engine**: Next.js App Router with Tailwind CSS v4.3.3.
- **Font Stack**:
  - Display / Headlines: **Geist** (`--font-geist`, weights 400, 500, 600, 700, 800) with `-0.02em` letter-spacing.
  - Body / UI: **Inter** (`--font-inter`, weights 400, 500, 600, 700) with font-feature-settings `"cv02", "cv03", "cv04", "cv11"`.
  - Monospace: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "JetBrains Mono", monospace`.
- **Canvas Principles**:
  - Clean, high-density layout with optical hairlines (`border-[var(--hairline)]`).
  - Subtle noise texture overlay (`bg-noise opacity-[0.25]`) and geometric grid matrix (`bg-grid`).
  - Radial ambient glow gradients centered behind primary hero sections.

### 1.2 Extracted Core CSS Variables (Raw Brand Tokens)
From `https://www.lostgit.com/_next/static/css/af993f704459b2fc.css`:

```css
/* Light Mode Root */
:root {
  --radius: 0.75rem; /* 12px */
  --background: oklch(100% 0 0);         /* Pure White #FFFFFF */
  --foreground: oklch(16% 0 0);          /* Deep Charcoal #171923 */
  --surface-1: oklch(97.5% 0 0);         /* Cloud Grey #F5F6FA */
  --surface-2: oklch(94% 0 0);           /* Surface Grey #ECEEF3 */
  --surface-3: oklch(90% 0 0);           /* Border Grey #E2E5EC */
  --hairline: oklch(16% 0 0 / 0.08);     /* Ultra-subtle divider */
  --hairline-strong: oklch(16% 0 0 / 0.16);
  --border: oklch(16% 0 0 / 0.1);
  --input: oklch(16% 0 0 / 0.12);
  --ring: oklch(16% 0 0 / 0.3);
  --shadow-elegant: 0 1px 0 0 oklch(16% 0 0 / 0.04), 0 8px 24px -12px oklch(16% 0 0 / 0.12);
  --shadow-glow: 0 0 0 1px oklch(16% 0 0 / 0.06), 0 24px 80px -20px oklch(16% 0 0 / 0.18);
  --shadow-premium: 0 30px 80px -30px oklch(16% 0 0 / 0.25);
}

/* Dark Mode (.dark) */
.dark {
  --background: oklch(4.5% 0 0);         /* Obsidian Black #0D0F14 */
  --foreground: oklch(98.5% 0 0);        /* Crisp White #F4F5F8 */
  --surface-1: oklch(9% 0 0);            /* Elevated Canvas #171A22 */
  --surface-2: oklch(12% 0 0);           /* Raised Panel #1D212B */
  --surface-3: oklch(15% 0 0);           /* Floating HUD #2A2F3B */
  --hairline: oklch(100% 0 0 / 0.08);
  --hairline-strong: oklch(100% 0 0 / 0.16);
  --border: oklch(100% 0 0 / 0.1);
  --input: oklch(100% 0 0 / 0.14);
  --ring: oklch(100% 0 0 / 0.3);
  --shadow-elegant: 0 1px 0 0 oklch(100% 0 0 / 0.04), 0 8px 24px -12px oklch(0% 0 0 / 0.6);
  --shadow-glow: 0 0 0 1px oklch(100% 0 0 / 0.06), 0 24px 80px -20px oklch(100% 0 0 / 0.08);
  --shadow-premium: 0 40px 120px -40px oklch(100% 0 0 / 0.12);
}
```

### 1.3 Key Brand Components & Patterns
1. **Badges**: Pill-shaped (`rounded-full`), hairline border, low-alpha background, uppercase 11px/12px text with letter spacing `tracking-[0.16em]` or `tracking-wider`.
2. **Buttons**:
   - Primary: High contrast (`bg-foreground text-background`), pill-shaped (`rounded-full h-11 px-6`), elegant shadow.
   - Secondary / Ghost: Glass strong (`glass-strong text-foreground border border-[var(--hairline)] hover:bg-[color-mix(in_oklab,var(--surface-3)_70%,transparent)]`).
3. **Icons**: Lucide icons, 16px to 20px, consistent 2px stroke width.
4. **Logos**: Dual-mode vector mark:
   - Light mode: `/logo-light.png`
   - Dark mode: `/logo-dark.png`
   - Accompanying typography: "LostGit Solutions" in Geist SemiBold with tight letter spacing.

---

## 2. LostGit Pay Identity: "Precision, Visibility, Control"

### 2.1 Strategic Differentiation
While **LostGit Solutions** (agency/studio) uses a stark monochrome foundation and **LostGit Academy** focuses on learning modules, **LostGit Pay** serves as the **financial operations and telemetry nerve center**.

To communicate financial authority and operational precision without breaking brand continuity:
- We retain the exact LostGit typography (`Geist` + `Inter`), rounded corners (`--radius: 0.75rem`), and hairline borders.
- We introduce **Electric Violet (`#6D5EF5`)** as the primary functional accent color for payments, active navigation, focus rings, and primary interactive controls.
- We introduce strict **Tabular Numerals (`tabular-nums`)** for all financial amounts, invoice totals, timestamps, and analytics counters.
- We integrate dedicated **Financial Status Semantics** (Success Green `#16A36A`, Warning Amber `#E59B25`, Danger Red `#D64545`, Informational Blue `#2878D0`).

### 2.2 Color Token Mapping

| Token Name | Light Theme Hex | Dark Theme Hex | Function |
| :--- | :--- | :--- | :--- |
| Canvas Background | `#FFFFFF` | `#0D0F14` | Root viewport canvas |
| Sidebar Surface | `#111318` | `#111318` | Persistent dark command sidebar (both modes) |
| Elevated Surface 1 | `#F5F6FA` | `#171A22` | Cards, table containers, panels |
| Raised Surface 2 | `#ECEEF3` | `#1D212B` | Hover states, active list rows, sub-cards |
| Floating Surface 3 | `#E2E5EC` | `#2A2F3B` | Popovers, tooltips, dialogs |
| Hairline Border | `rgba(17, 19, 24, 0.08)` | `rgba(255, 255, 255, 0.08)` | Micro dividers, structural grid |
| Structural Border | `rgba(17, 19, 24, 0.12)` | `rgba(255, 255, 255, 0.12)` | Card and table outlines |
| Text Primary | `#171923` | `#F4F5F8` | Headers, KPIs, main content |
| Text Secondary | `#667085` | `#A5ADBA` | Table data, descriptions, labels |
| Text Muted | `#98A2B3` | `#6C7689` | Timestamps, helper hints, breadcrumbs |
| Brand Accent | `#6D5EF5` | `#8B80FF` | Primary buttons, active tabs, focus ring |
| Accent Hover | `#5B4CE0` | `#7769F8` | Hover/active states |
| Accent Tint | `#F0EEFF` | `rgba(109, 94, 245, 0.15)` | Active item background, badges |
| Success Green | `#16A36A` | `#38C987` | Paid invoices, active entitlements, healthy APIs |
| Success Surface | `#EAF8F0` | `rgba(22, 163, 106, 0.15)` | Status pill background |
| Warning Amber | `#E59B25` | `#F0B84B` | Pending instalments, grace periods |
| Warning Surface | `#FFF5DF` | `rgba(229, 155, 37, 0.15)` | Status pill background |
| Error Red | `#D64545` | `#FF7373` | Failed payments, suspended entitlements |
| Error Surface | `#FDECEC` | `rgba(214, 69, 69, 0.15)` | Status pill background |

---

## 3. Brand Audit Checklist & Continuity Verification

- [x] Verified main site `https://www.lostgit.com/` live assets and stylesheets.
- [x] Verified secondary site `https://academy.lostgit.com/` live assets and stylesheets.
- [x] Maintained exact font hierarchy: `Geist` headlines and `Inter` body with OpenType features.
- [x] Maintained LostGit pill-badge styling with hairline borders and tracking.
- [x] Retained dual-mode logo conventions (`logo-dark.png` / `logo-light.png`).
- [x] Established distinct financial product accent (Electric Violet) tailored for billing & analytics.
