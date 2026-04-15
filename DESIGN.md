# Design System Strategy: The Kinetic Architect

## 1. Overview & Creative North Star
The "Kinetic Architect" is the creative North Star for this design system. It moves beyond the static, boxy nature of traditional project management tools to create a workspace that feels like a precision instrument. By blending the utilitarian density of GitHub with the refined, motion-driven elegance of Linear, we create an environment that honors the "Flow State."

The system rejects the "template" look by utilizing **Intentional Asymmetry**. Instead of a centered, rigid grid, we lean into left-aligned information density and purposeful whitespace "voids." This creates a sophisticated, editorial rhythm where the eye is led through data by weight and typography, not by boxes.

## 2. Colors: Tonal Architecture
The palette is built on a foundation of "Cool Slate" with high-energy "Neural Accents." We rely on Chromatic Layering rather than structural lines.

### The "No-Line" Rule
Traditional 1px borders are largely prohibited for sectioning. Boundaries must be defined by background color shifts. A `surface-container-low` (#f2f4f6) sidebar sitting on a `surface` (#f7f9fb) background provides all the separation necessary. This "No-Line" approach keeps the interface feeling expansive and modern.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. 
- **Base Layer:** `surface` (#f7f9fb)
- **Primary Content Areas:** `surface-container-lowest` (#ffffff)
- **Secondary Utilities:** `surface-container-low` (#f2f4f6)
- **Interactive Modals:** `surface-container-highest` (#e0e3e5)

### The "Glass & Gradient" Rule
To inject "soul" into the data-dense environment, use a **Signature Texture** for Primary CTAs. Do not use a flat indigo. Instead, apply a subtle linear gradient from `primary` (#2a14b4) to `primary_container` (#4338ca) at a 135-degree angle. This mimics the slight sheen of high-end hardware. Floating navigation or command palettes should utilize `surface-container-lowest` with a 12px backdrop-blur and 85% opacity to create a "frosted glass" effect.

## 3. Typography: Editorial Utility
We pair the Swiss-style efficiency of **Inter** with the technical precision of **JetBrains Mono**.

*   **Display & Headlines:** Use `headline-sm` (1.5rem) for page titles. Set them with a tighter letter-spacing (-0.02em) to give them an authoritative, "printed" feel.
*   **The Technical Sub-layer:** All IDs, Git hashes, and alphanumeric project codes must use **JetBrains Mono** at `label-sm` (0.6875rem). This creates a clear visual distinction between "Human Language" and "Machine Data."
*   **Hierarchy through Weight:** Use `on_surface_variant` (#464554) for metadata and `on_surface` (#191c1e) for primary content. The contrast between these two tokens is the primary driver of readability.

## 4. Elevation & Depth: Tonal Layering
We move away from the "shadow-heavy" web. Depth is a result of light and material, not artificial dropshadows.

*   **The Layering Principle:** To lift an element, change its surface token. A card should be `surface-container-lowest` placed on a `surface-container-low` background. This creates a "soft lift."
*   **Ambient Shadows:** If a floating element (like a dropdown) requires a shadow, use a multi-layered "Ghost Shadow": 
    *   `0 4px 20px -2px rgba(25, 28, 30, 0.04), 0 2px 8px -2px rgba(25, 28, 30, 0.02)`
*   **The "Ghost Border" Fallback:** In high-density data tables where separation is critical, use a 1px border using `outline_variant` (#c7c4d7) at **20% opacity**. It should be felt, not seen.

## 5. Components: Precision Primitives

### Buttons & Actions
*   **Primary:** Gradient of `primary` to `primary_container`. White text. No border. `md` (0.375rem) corner radius.
*   **Flat Action Buttons:** For high-density toolbars, use `surface-container-low` with `on_surface` text. On hover, shift to `surface-container-high`.
*   **Interaction:** States should be subtle. A 2% darkening of the background color or a 1px vertical "lift" via transform is sufficient.

### Status Badges (The "Signal" System)
Badges must use the "Soft & Saturated" approach:
*   **Approved:** Background `secondary_fixed` (#d8e2ff) with Text `on_secondary_fixed_variant` (#004395).
*   **Pending:** Background `tertiary_fixed` (#ffdbcd) with Text `tertiary` (#692400).
*   **Closed:** Background `surface_container_high` (#e6e8ea) with Text `on_surface_variant` (#464554).

### Cards & Lists
*   **Constraint:** Forbid divider lines between list items. 
*   **Execution:** Use `0.5rem` (spacing-2.5) of vertical padding and a hover state of `surface-container-lowest` to define row boundaries. 

### Input Fields
*   Minimalist "Underline" or "Ghost" style. 
*   Default state: `surface-container-highest` background, no border.
*   Focus state: 1px border using `secondary` (#0058be) with a 2px "outer glow" of the same color at 10% opacity.

### Navigation (The "Command Bar")
A floating `surface-container-lowest` bar at the bottom or top-center of the screen, utilizing glassmorphism and the JetBrains Mono font for keyboard shortcuts (e.g., `⌘K`).

## 6. Do's and Don'ts

### Do
*   **Do** use `0.9rem` (spacing-4) and `1.1rem` (spacing-5) for most internal padding to maintain a high-density, professional feel.
*   **Do** use JetBrains Mono for any value that is calculated by the system (dates, times, PR numbers).
*   **Do** lean into `surface-container-low` for large background areas to make `white` content cards pop.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#191c1e).
*   **Don't** use "Heavy" shadows. If the depth isn't clear through color, your surface hierarchy is likely broken.
*   **Don't** use standard 12px or 16px border radii. Keep the system "Sharp" with the `DEFAULT` (0.25rem) or `md` (0.375rem) scale to maintain the professional, engineered aesthetic.