# Design Direction

## Visual Goal

Bold, fast and confident — but still a clean, trustworthy commerce and operations platform rather than a complicated ERP. Brand identity (logo, colour, type, voice) is defined in **`brand.md`**; this file covers how the interface applies it.

## Principles

- Prioritize clarity over decoration.
- Use generous spacing and strong visual hierarchy.
- Keep primary actions obvious.
- Show product imagery prominently.
- Use progressive disclosure for advanced settings.
- Make important status and error states easy to understand.

## Visual Language

- **60:30:10** — 60% white (page, cards, tables) · 30% light green (Paper `#F3F8F1` / `#E7EDE5`: section bands, hero panel, sidebar, footer, image wells) · 10% brand/accent (Deep Green `#0E2F2C` + Lime `#C6F432`: primary buttons, icons, highlights, one closing CTA band)
- Deep Green is also the text colour (text doesn't count toward the ratio)
- Lime is never text on white or Paper; on light backgrounds it only sits *behind* Deep Green text (highlighter, selected-nav tint)
- Archivo throughout: Black Expanded for page headlines (`font-display`), Bold for subheads, Regular body, SemiBold buttons
- Subtle borders and restrained shadows; no glows or effects
- Medium corner radius for cards and controls
- Lucide icons for interface actions
- Minimal gradients and animations

Tokens live in `src/app/globals.css`; never hard-code hex values in components.

## Public Website

- Large, concise hero statement
- Product or lifestyle image beside the main CTA
- Short sections with clear headings
- Product cards with consistent mockups
- Repeated but restrained onboarding CTA
- Responsive, mobile-first layouts

## User Workspace

- Sidebar navigation on desktop
- Bottom navigation or compact menu on mobile
- Dashboard cards for orders, revenue, and design status
- Tables with filters and clear status badges
- Empty states that explain the next action
- Confirmation steps for publishing designs or sending orders

## Design Studio

- Large central product preview/canvas
- Left panel for assets, text, templates, and layers
- Right panel for properties and print requirements
- Clear print-area boundary and safe zone
- Undo/redo, zoom, and reset controls
- Preview mode before saving or publishing
- Visible validation messages for low resolution or overflow

## Accessibility

- Keyboard-accessible controls
- Visible focus states
- Sufficient color contrast
- Text labels for icon-only controls
- Do not rely on color alone for order or design status

## Responsive Behavior

- Public pages must be mobile-first.
- The Design Studio may use a simplified mobile layout.
- Complex admin tables should support horizontal scrolling or responsive card views.
