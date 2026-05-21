---
name: Celestial Velocity
colors:
  surface: '#0d1321'
  surface-dim: '#0d1321'
  surface-bright: '#333948'
  surface-container-lowest: '#070e1b'
  surface-container-low: '#151c29'
  surface-container: '#19202d'
  surface-container-high: '#232a38'
  surface-container-highest: '#2e3543'
  on-surface: '#dce2f5'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dce2f5'
  inverse-on-surface: '#2a303f'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#b8c4ff'
  on-tertiary: '#1a2b6a'
  tertiary-container: '#7e8dd2'
  on-tertiary-container: '#122463'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#dde1ff'
  tertiary-fixed-dim: '#b8c4ff'
  on-tertiary-fixed: '#001354'
  on-tertiary-fixed-variant: '#334282'
  background: '#0d1321'
  on-background: '#dce2f5'
  surface-variant: '#2e3543'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Geist
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
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is engineered for a high-performance gaming marketplace, blending the reliability of enterprise SaaS with the immersive energy of futuristic digital environments. It targets a tech-savvy Indonesian gaming audience that values speed, security, and prestige.

The visual style is centered on **Glassmorphism**. This is achieved through multi-layered translucency, high-fidelity backdrop blurs, and "light-leak" gradients that simulate a holographic interface. The aesthetic is sophisticated and deep, using light not just as a highlight, but as a functional signifier of interactivity and state changes.

## Colors
This design system utilizes a "Deep Space" palette. The core foundation is built on **Midnight Blue** (#050B18) for primary backgrounds to ensure maximum contrast for glowing elements.

- **Electric Blue (#3B82F6):** Used for primary actions, progress indicators, and brand-heavy components.
- **Cyan Glow (#06B6D4):** Reserved for success states, accent highlights, and secondary interactive elements to provide a "neon" contrast.
- **Surface Layering:** Surfaces use **Dark Navy** (#0A1128) with varying levels of opacity (typically 60-80%) to facilitate the glass effect.
- **Typography:** Pure white (#FFFFFF) is used for headings to ensure readability against dark backgrounds, while a tinted silver/blue-grey is used for secondary text to reduce eye strain.

## Typography
The typography strategy pairs **Geist** for technical precision in headings and UI labels with **Inter** for legible, high-density body information. 

Headings should utilize tighter letter-spacing and bold weights to create a commanding "display" presence. For digital marketplace listings (prices, stock levels), use the Label styles to maintain a structured, data-driven look. On mobile, headlines scale down slightly to ensure high-impact messaging remains within the viewport without excessive wrapping.

## Layout & Spacing
The layout follows a **fluid 12-column grid** for desktop, transitioning to a 4-column grid for mobile devices. 

- **Spacing Rhythm:** All margins and paddings are derived from an 8px base unit. 
- **Content Max-Width:** The main interface is capped at 1280px to maintain readability on ultrawide gaming monitors.
- **Negative Space:** Use generous internal padding within glass containers (minimum 24px) to emphasize the "floating" nature of the UI.
- **Horizontal Flow:** For mobile marketplaces, use horizontal scrolling carousels for game categories to maximize vertical screen real estate.

## Elevation & Depth
Depth in this design system is created through **optical stacking** rather than traditional drop shadows.

1.  **Backdrop Blur:** Every floating surface must utilize `backdrop-blur-xl` (24px) to create a sense of frosted glass.
2.  **Inner Borders:** Use a 1px top-oriented white border at 10-15% opacity to simulate a "glass edge" that catches light from above.
3.  **Glow States:** Instead of shadows, elevated elements (like active cards or primary buttons) use an outer "bloom" effect—a soft, diffused glow using the primary color (#3B82F6) at 20% opacity.
4.  **Z-Axis:** 
    - Level 1: Background (Deep Space).
    - Level 2: Surface (Dark Navy, 60% opacity).
    - Level 3: Interactive/Hover (Dark Navy, 80% opacity + Inner Border).

## Shapes
The shape language is contemporary and approachable. Standard UI elements (inputs, small buttons) utilize a 0.5rem radius.

Large containers and product cards must use **1rem (rounded-2xl)** to emphasize the "premium object" feel. Circular shapes are reserved strictly for user avatars and notification pips. Avoid sharp corners to maintain the sophisticated SaaS-like fluidity.

## Components

- **Glass Cards:** The primary container for game products. They feature a subtle gradient background (Dark Navy to Transparent), a 1px semi-transparent inner border, and a 24px backdrop blur. On hover, the inner border opacity increases.
- **Glow Buttons:** Primary buttons are solid Electric Blue with a transition to a Cyan gradient on hover. They should emit a soft glow matching their background color.
- **Futuristic Inputs:** Input fields are dark with a 1px border. When focused, the border glows Cyan and the backdrop blur increases, creating a "lens" effect.
- **Chips & Tags:** Small, semi-transparent capsules used for game genres (e.g., "RPG", "FPS"). They use Geist Medium for the font and have a subtle color tint based on the category.
- **Interactive Lists:** Used for transaction history. Rows should have a subtle hover state that lifts the opacity of the background, rather than changing the color entirely.
- **Price Indicators:** Prices should always be displayed in a high-contrast white Geist font, often accompanied by a small "Cyan Glow" icon to denote digital currency or points.