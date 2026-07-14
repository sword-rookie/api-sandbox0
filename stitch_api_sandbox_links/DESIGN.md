---
name: Cybernetic Sandbox
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#b7c8e1'
  on-secondary: '#213145'
  secondary-container: '#38485d'
  on-secondary-container: '#a6b6cf'
  tertiary: '#d8ffe7'
  on-tertiary: '#003824'
  tertiary-container: '#65f2b5'
  on-tertiary-container: '#006d4a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c2f'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  error-red: '#ffb4ab'
  glow-rgba: rgba(0, 240, 255, 0.2)
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
---

## Brand & Style
The brand identity is rooted in a "Technical Futurism" aesthetic, specifically designed for high-end developer tools. It balances high-performance utility with a cinematic, "cyberpunk-lite" atmosphere. The target audience—DevOps engineers and backend developers—responds to an interface that feels like a mission control center: dark, precise, and authoritative.

The design style is a hybrid of **Minimalism** and **Glassmorphism**, using deep black surfaces, neon cyan accents, and subtle glowing effects to simulate a sophisticated software environment. Visual interest is generated through micro-animations like node pulsing and background grid overlays, reinforcing the metaphor of a live, interconnected infrastructure.

## Colors
The palette is dominated by an "Onyx & Cyan" scheme. The background utilizes a true black (`#000000`) or near-black (`#0A0A0A`) to maximize the perceived luminosity of the primary cyan accent.

- **Primary Cyan:** Used for high-priority actions, status indicators, and branding elements. It is frequently accompanied by a 15px soft glow effect to suggest "active" energy.
- **Surface Tiers:** Depth is created using a scale of dark grays. `surface-container-low` is the default section background, while `surface-container-lowest` provides maximum contrast for card elements.
- **Functional Accents:** Secondary muted blues handle auxiliary navigation, while a specific "error-red" is reserved for high-contrast "Old Way" or warning states.

## Typography
The system uses a two-font strategy. **Inter** provides a neutral, highly legible foundation for all UI text and marketing copy, relying on varied weights and tight letter-spacing in larger sizes to convey modernism. **JetBrains Mono** is utilized for technical identifiers, step numbers, and code snippets, reinforcing the developer-centric nature of the product.

Hierarchy is strictly enforced through a "Label-Caps" style for overlines and specific display roles for hero sections. Headlines should generally use a semi-bold (600) weight to stand out against dark backgrounds.

## Layout & Spacing
The layout follows a **Fixed Grid** approach for marketing sections, centering content within a maximum width of 1440px. A vertical rhythm is established using a 4px base unit, with standard section padding set to `3xl` (64px) to provide significant breathing room.

- **Desktop:** Utilizes a standard 12-column grid logic for features, reflowing to a 4-column timeline for process steps.
- **Mobile:** Margins shrink to 16px. Hero text scales down significantly, and multi-column grids collapse into a single vertical stack.
- **Navigation:** A fixed top-bar uses `backdrop-blur-xl` to maintain context while scrolling.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Luminous Accents** rather than traditional shadows.
- **Primary Depth:** Achieved by stacking `surface-container` tiers. Higher-elevation elements (like cards) use lighter surface shades (`surface-container-high`) or deep black backgrounds with primary-colored borders.
- **Glassmorphism:** Navigation bars and "Play" buttons use 80% opacity backgrounds with high-saturation blurs to feel light and floating.
- **The Glow:** Elevation is often "emitted" rather than "cast." The `primary-glow` uses a cyan-tinted shadow (`rgba(0, 240, 255, 0.2)`) to indicate interactive or active elements.

## Shapes
The shape language is "Softly Geometric." While the grid is rigid, component corners are rounded to balance the technical aesthetic with approachability.
- **Buttons & Cards:** Use a base `1rem` (rounded-xl) for a premium, modern feel.
- **Input & Small Elements:** Use `0.5rem` (rounded-lg).
- **Indicators:** Circular or pill-shaped for status badges and step numbers.
- **Borders:** Thin, 1px lines in `outline-variant` define structure without overwhelming the content.

## Components
- **Primary Button:** Solid `primary-container` background, bold Inter text, and a `primary-glow`. Includes a slight scale-down effect (`active:scale-95`) for tactile feedback.
- **Secondary Button:** Transparent background with a 1px `outline-variant` border. Hover state shifts background to `surface-container`.
- **Status Chips:** High-contrast capsules with `label-caps` typography, often featuring a subtle background tint of the status color (e.g., cyan/10%).
- **Feature Cards:** `surface-container-lowest` backgrounds with `outline-variant` borders. On hover, the border color may shift towards the primary cyan.
- **Timeline:** A thin horizontal line connecting circular step indicators, using `JetBrains Mono` for step numbers.
- **Icons:** Material Symbols (Outlined), consistent 400 weight, sized to 24px for standard UI and 32px-120px for illustrative feature moments.