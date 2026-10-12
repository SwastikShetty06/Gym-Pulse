# Tier-1 Software Craft & Anti-Slop Directive

Governing standard benchmarked against Tier-1 products (Linear, Stripe, Raycast, GitHub). All code in this repository must strictly adhere to these standards.

## Part A: Ban List (Zero Tolerance)
1. **Visual Cliches**:
   - No sparkle emojis (✨), magic wands, floating action buttons in the corner.
   - No purple/indigo neon gradient headers or glowing card borders (`border-purple-500`).
   - No 3D isometric pastel illustrations or generic AI cartoon graphics.
2. **Interaction Slop**:
   - No forcing users to type natural language prompts when a button, slider, filter, or shortcut is faster.
   - No unsolicited hovering tooltips ("Rewrite with AI", "Summarize").
   - No artificial slow typewriter token streams for short text.
   - No Cumulative Layout Shift (CLS > 0) caused by unconstrained streaming containers.
3. **Language Slop**:
   - No buzzwords: "supercharge", "unleash", "magic", "game-changing", "next-gen".
   - No anthropomorphic language: "I think...", "I found this for you", "I am happy to help".

## Part B: Performance & Tactile Responsiveness
1. **Optimistic Updates & Local State**:
   - All mutations (status changes, renames, deletions, toggles) reflect in the UI within 50ms locally before server roundtrips.
   - Implement rollback with non-blocking error toasts if server rejects the write.
2. **Fluid, Physically Grounded Micro-Interactions**:
   - Crisp, subtle transition durations: 100ms–150ms for hovers and active states, 200ms–250ms for sheet drawers or modals.
   - Never use linear transitions or sluggish animations (>300ms) that delay user interaction.
3. **State Preservation**:
   - Form inputs and ongoing drafts persist locally (localStorage/IndexedDB) so page refreshes never cause data loss.

## Part C: Ergonomics & Power-User Architecture
1. **Universal Keyboard Accessibility**:
   - Command Palette: Implement a `Cmd+K` / `Ctrl+K` searchable palette for all major actions.
   - Single-Key Navigation: Support `j`/`k` (or arrow keys) for list traversal, `Enter` to open, `Esc` to close overlays or clear filters.
   - Visible, Purpose-Built Focus: Ensure `:focus-visible` styles are crisp and styled (e.g., 2px solid offset ring). Never strip focus outlines without replacing them.
2. **URL as Single Source of Truth**:
   - Store all active filters, pagination cursors, search queries, and selected drawer IDs in URL search parameters (`?filter=active&sort=date_desc`).
   - Browser back/forward navigation must work seamlessly across UI states.

## Part D: Typography, Elevation & Visual Discipline
1. **Typographic Precision**:
   - Single high-quality neutral sans-serif (Inter/system fonts) with monospace accent for metrics/IDs.
   - Numeric Data: Always enable tabular numbers (`font-feature-settings: 'tnum'`) on tables, metrics, timers, and balances to prevent layout jiggle.
   - Strict 5-tier typographic scale: 12px caption, 14px body, 16px subhead, 20px section header, 28px page title.
2. **Contrast & Elevation Hierarchy**:
   - Depth through surface color differentiation (`#09090b` bg, `#18181b` card/panel, `#27272a` border) rather than heavy blurred drop shadows.
   - Clean borders with high contrast (minimum 4.5:1 text-to-background).
3. **Consistent Density**:
   - 8px/4px spatial grid for all margins, padding, and gaps.
   - Minimum 36px–40px touch/click target for buttons, 32px for compact table rows.

## Part E: Invisible Intelligence & Domain Utility
1. **AI as an Engine, Not a Novelty**:
   - Embed intelligence inside standard components: fuzzy multi-field search, intelligent autocompletion, automated background categorization.
   - Structured data cards, native table rows, or editable diffs—never conversational chatbot bubbles.
2. **Actionable Empty and Error States**:
   - State why concisely, display keyboard shortcuts, offer immediate primary action button.
   - On error, state the exact reason with a one-click retry button.
