---
name: DBT-GUARD Portal
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#45464e'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4f5e81'
  primary: '#041534'
  on-primary: '#ffffff'
  primary-container: '#1b2a4a'
  on-primary-container: '#8392b7'
  inverse-primary: '#b7c6ee'
  secondary: '#3a6188'
  on-secondary: '#ffffff'
  secondary-container: '#acd2ff'
  on-secondary-container: '#335b81'
  tertiary: '#001c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#013300'
  on-tertiary-container: '#3ba72b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b7c6ee'
  on-primary-fixed: '#0a1a3a'
  on-primary-fixed-variant: '#384668'
  secondary-fixed: '#d0e4ff'
  secondary-fixed-dim: '#a3caf6'
  on-secondary-fixed: '#001d35'
  on-secondary-fixed-variant: '#1f496f'
  tertiary-fixed: '#8dfc75'
  tertiary-fixed-dim: '#72de5c'
  on-tertiary-fixed: '#012200'
  on-tertiary-fixed-variant: '#035300'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
  accent-saffron: '#FF9933'
  accent-green: '#138808'
  background-slate: '#F4F6F9'
  surface-card: '#FFFFFF'
  border-subtle: '#D1D5DB'
  border-strong: '#9CA3AF'
  status-ready: '#138808'
  status-ready-bg: '#DCFCE7'
  status-warning: '#D97706'
  status-warning-bg: '#FEF3C7'
  status-error: '#DC2626'
  status-error-bg: '#FEE2E2'
  status-pending: '#6B7280'
  status-pending-bg: '#F3F4F6'
  disclaimer-banner-bg: '#FEF3C7'
  disclaimer-banner-border: '#F59E0B'
  disclaimer-banner-text: '#92400E'
  tricolor-gradient: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)'
typography:
  display-lg:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  display-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.2px
  label-md:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.4px
  label-sm:
    fontFamily: Noto Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.5px
  data-mono:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 1px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system defines an institutional, high-trust administrative interface tailored for Krishi Bhavan agricultural extension officers in Thrissur, Kerala. The portal addresses critical, time-sensitive PM-KISAN Direct Benefit Transfer (DBT) payment rejections, requiring an aesthetic anchored in authoritative clarity, rapid triage capability, and uncompromising accessibility.

### Design Philosophy & Movement
The design language draws directly from the Guidelines for Indian Government Websites (GIGW 3.0) and India's National Portal standards, merged with modern institutional minimalism. Visual embellishment is minimized in favor of functional hierarchy, high-density data legibility, and unmistakable operational states. The layout projects governmental dignity and procedural efficiency without relying on official sovereign crests or the Ashoka Lion capital. A persistent disclaimer framework establishes its academic/prototype identity while retaining complete structural compliance.

### Emotional Target & Key Principles
- **Clarity & Urgency:** Agricultural officers handle vulnerable rural beneficiaries; failure points (NPCI Aadhaar unlinking, PFMS invalid account errors) must be actionable within seconds.
- **Bilingual Institutional Rigor:** Seamless coexistence of English and Malayalam script with equivalent visual optical weight.
- **Tactile Accessibility:** High-contrast focus rings, screen-reader-optimized touch targets, and resilient, responsive form controls designed for varied district office hardware.

## Colors

The color palette reinforces constitutional and official familiarity through deliberate, civic-minded accents while prioritizing WCAG 2.1 AA/AAA compliance across all text and state boundaries.

### Core Architecture
- **Primary Navy (`#1B2A4A`):** Anchors high-level navigation, universal utility headers, operational toolbars, and portal footers. Conveys solemn administrative governance.
- **Secondary Deep Blue (`#0B3B60`):** Used for primary call-to-actions, sub-navigation tiers, active interactive states, and structured data tables.
- **Background Slate (`#F4F6F9`):** A low-glare institutional canvas that offsets pure white cards, mitigating eye strain during continuous desktop case processing.
- **Surfaces & Borders (`#FFFFFF`, `#D1D5DB`):** Crisp, isolated card surfaces defined by precise 1px borders for structural delineation without deep drop shadows.

### Status & Verification Engine
- **Success / Credited (`#138808` / `#DCFCE7`):** Direct credit resolved, Aadhaar-seeded, active mandates.
- **Action Required / Verification (`#D97706` / `#FEF3C7`):** Field verification needed, duplicate record matches, local spelling variances.
- **Failed / Blocked (`#DC2626` / `#FEE2E2`):** NPCI map detachment, dormant account, land record mismatch.
- **Deferred / Pending (`#6B7280` / `#F3F4F6`):** Treasury release pending, batch processing in transit.

### Indian Tricolor Decorative Strip
A subtle 3px to 4px horizontal gradient (`#FF9933` → `#FFFFFF` → `#138808`) serves exclusively as an institutional divider below the main navigation bar and atop major data summaries, anchoring the platform's public sector context.

## Typography

Typography prioritizes legibility, standardized multilingual alignment, and high optical recognition under variable field conditions. `Noto Sans` functions as the system's Latin base, while `Noto Sans Malayalam` is explicitly paired as the fallback font for regional script parity.

### Malayalam & Multilingual Balance
- Ensure identical vertical baseline metrics between Noto Sans and Noto Sans Malayalam. For complex conjuncts, line heights must not dip below `1.5x` the font size to prevent glyph clipping.
- Malayalam script must never be set in weights lighter than `400` (Regular) or heavier than `700` (Bold) to preserve counter space clarity.

### Masked Data & Identifier Rules
For Aadhaar, PFMS account IDs, and survey numbers, use `data-mono` specifications: fixed spacing, bold terminal digits (`XXXX-XXXX-7841`), and high contrast to reduce misdialed officer outreach.

## Layout & Spacing

The layout follows a structured 12-column fixed-max-width grid (capped at `1440px`) centered on canvas, adapting down to 8 columns on tablet devices (`768px - 1023px`) and 4 fluid columns on mobile devices (`< 768px`).

### Spatial Rhythm
- **Rhythm Unit:** 4px baseline grid with standard multiples of 8px (`0.5rem`, `1rem`, `1.5rem`).
- **Dense Data Accommodation:** Tables and case item lists utilize a condensed vertical rhythm (`0.5rem` row gap) with generous horizontal padding (`1rem`) to keep large caseloads scannable on standard 1080p government monitor terminals without endless scrolling.
- **Top Utility Header:** Fixed 40px utility band accommodating accessibility controls, screen sizing toggles, and language selectors.

## Elevation & Depth

In alignment with GIGW conventions, spatial depth is primarily conveyed through planar grouping and crisp boundary definition rather than heavy drop shadows.

- **Level 0 (Base Canvas):** Background Slate (`#F4F6F9`), continuous and matte.
- **Level 1 (Card & Module Layer):** Pure white `#FFFFFF` surface enclosed with a 1px solid border in `#D1D5DB`. Zero blur or a nominal ambient shadow (`0 1px 2px rgba(0, 0, 0, 0.05)`) ensures structural separation without distracting fuzziness.
- **Level 2 (Hover & Active States):** Accentuated boundary (`#0B3B60` or `#9CA3AF`) and a tight elevation shadow (`0 4px 6px -1px rgba(27, 42, 74, 0.08)`).
- **Level 3 (Modals, Overlays & Urgent Drawers):** High-opacity scrim overlay (`rgba(27, 42, 74, 0.6)`) and a focused drop shadow (`0 10px 15px -3px rgba(0, 0, 0, 0.15)`), keeping administrative officers focused on resolving the specific beneficiary prompt.

## Shapes

The portal adheres to an institutional 8px corner radius (`roundedness: 2`), balancing modern software design with clean, structured lines.

- **Cards, Panels & Data Containers:** Standard 8px (`0.5rem`) radius.
- **Action Buttons & Form Inputs:** 6px to 8px radius to maintain a clear, clickable silhouette.
- **Status Badges & Pill Indicators:** Fully rounded pill shapes (`9999px`) to visually differentiate metadata chips from interactive square buttons.
- **Table Outlines:** 8px wrapper bounds with sharp interior cells for clean data grid lines.

## Components

### 1. GIGW Accessibility Strip
- Placed at the very top of the portal. Background: `#1B2A4A`, height: 40px, text: `#FFFFFF`.
- Contains: Text sizing controls (`A-`, `A`, `A+`), high-contrast toggle, screen reader skip-to-content links, and Malayalam/English quick-switch toggle buttons.

### 2. Search & Category Triage Bar
- Combined single unit featuring a primary category dropdown (Beneficiary Name, Aadhaar Hash, PM-KISAN ID, Village/Ward), an input field with clear focus states (`outline: 2px solid #0B3B60`), and a secondary navy search action button.

### 3. Case Tracker Cards & Data Rows
- White container, 1px `#D1D5DB` border, 8px radius.
- Includes farmer name (English + Malayalam), masked identity indicators (`XXXX-XXXX-7841`), failure category tag (e.g., "PFMS Rejection: Invalid IFSC"), village jurisdiction, and elapsed time since failure.

### 4. Status Badges
- Pill-shaped (`rounded-full`), padded `4px 10px`, typography `label-sm`.
- **Ready/Credited:** `#138808` text on `#DCFCE7` background.
- **Needs Verification:** `#D97706` text on `#FEF3C7` background.
- **Action Required / Stuck:** `#DC2626` text on `#FEE2E2` background.
- **Payment Pending:** `#4B5563` text on `#F3F4F6` background.

### 5. Disclaimer Banner (Student Prototype)
- Prominently anchored below the primary branding header.
- Background: `#FEF3C7`, 1px solid border `#F59E0B`, text: `#92400E`, with a warning icon and explicit notice clarifying that the platform is an academic demonstration for Krishi Bhavan Thrissur without official state endorsement.

### 6. Malayalam Voice Assist Indicator
- Dedicated contextual helper button next to vernacular fields. Displays an interactive audio wave icon (`#0B3B60`) allowing officers to listen to recorded beneficiary phonetic names or automated failure explanations in Malayalam.

### 7. Form Controls & Buttons
- **Primary Button:** `#0B3B60` background, `#FFFFFF` text, 8px radius, padded `10px 20px`. Hover: `#1B2A4A`.
- **Secondary / Action Button:** White background, 1px `#0B3B60` border, `#0B3B60` text.
- **Inputs & Dropdowns:** Minimum 44px touch height, 1px `#D1D5DB` border, active ring with `#0B3B60`.