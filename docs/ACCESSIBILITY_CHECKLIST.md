# LostGit Pay — Accessibility & WCAG 2.2 AA Compliance Checklist

**Document Version:** 1.0.0  
**Target Standard:** WCAG 2.2 Level AA  
**Platform:** LostGit Pay (`pay.lostgit.com`)  

---

## 1. Perceivable

- [x] **Color Contrast (Text)**:
  - Normal text (< 18pt / 24px) achieves minimum 4.5:1 contrast against light (`#FFFFFF`, `#F5F6FA`) and dark (`#0D0F14`, `#171A22`) backgrounds.
  - Primary dark text on light: `#171923` on `#FFFFFF` (Contrast: 16.4:1).
  - Primary light text on dark: `#F4F5F8` on `#0D0F14` (Contrast: 16.8:1).
  - Secondary text on light: `#667085` on `#FFFFFF` (Contrast: 4.8:1).
  - Secondary text on dark: `#A5ADBA` on `#0D0F14` (Contrast: 8.6:1).
- [x] **Non-Text Contrast (UI Components & Boundaries)**:
  - Form input borders, checkboxes, and buttons maintain at least 3:1 contrast against surrounding surfaces.
  - Active focus indicators use high-contrast Electric Violet (`#6D5EF5` in light, `#8B80FF` in dark).
- [x] **Information & Relationships**:
  - Semantic HTML landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`.
  - Proper heading structure: Exactly one `<h1>` per page, sequential `<h2>` and `<h3>`.
  - Tables use proper `<th>` scope, column headers, and accessible labels.
- [x] **Sensory Characteristics**:
  - Status badges never rely on color alone. Each status badge combines an icon (check, clock, alert triangle) and an explicit textual label (e.g., "Paid", "Pending", "Suspended").

---

## 2. Operable

- [x] **Keyboard Navigation**:
  - All interactive elements (buttons, links, inputs, dropdown triggers, tabs, pagination) are fully reachable via the `Tab` key.
  - Interactive menus and dialogs trap focus when open and return focus to the trigger element upon closing.
  - Escape key dismisses modals, drawers, and popovers.
- [x] **Focus Visible**:
  - Every interactive component includes an unmistakable 2px focus ring with 2px offset (`ring-2 ring-violet-500 ring-offset-2`).
- [x] **Target Size (Minimum 24x24px, Recommended 44x44px)**:
  - Touch targets on mobile and desktop meet or exceed 44x44px for primary actions, with minimum 8px padding around compact icons.
- [x] **Motion Sensitivity (`prefers-reduced-motion`)**:
  - CSS animations and Framer Motion transitions respect `@media (prefers-reduced-motion: reduce)` by disabling transforms and duration delays.

---

## 3. Understandable

- [x] **Predictable Navigation**:
  - Global navigation sidebar maintains uniform positioning and ordering across all routes.
  - Breadcrumbs reflect the hierarchical route ancestry.
- [x] **Form Labels & Error Prevention**:
  - Every form input has an associated `<label>` or explicit `aria-label`.
  - Destructive financial and entitlement actions (e.g. suspending a project licence, refunding an invoice, rotating keys) require a two-step confirmation dialog with an explicit confirmation reason.
  - Validation errors provide clear inline messages connected via `aria-describedby`.

---

## 4. Robust

- [x] **ARIA Roles & States**:
  - Dialogs implement `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`.
  - Tabs implement `role="tablist"`, `role="tab"`, and `role="tabpanel"`.
  - Dynamic loading spinners declare `role="status"` and `aria-live="polite"`.
- [x] **Data Visualisation Fallbacks**:
  - Every chart container provides a descriptive summary and accessible tabular data or tooltips with screen-reader accessible values.
