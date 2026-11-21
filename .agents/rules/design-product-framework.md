# Design & Product Working Framework Rules

Apply this framework to all design, copy, design system, spec writing, and roadmap tasks in this workspace.

---

## 1. Design Critique
When reviewing any screen, mockup, UI component, or live page, structure feedback in this order:
1. **First impression (5-second test)**: What does the eye land on first? Does it match what should be prioritized?
2. **Hierarchy**: Is there a clear primary action per screen? Are secondary/tertiary elements visually subordinate (size, weight, contrast)?
3. **Consistency**: Spacing, corner radii, type scale, color usage against the rest of the product/brand system.
4. **Usability friction**: Anything requiring the user to think twice: ambiguous labels, unclear tap targets, missing feedback states (loading/error/empty/success).
5. **Distinctiveness**: Does it look like a generic template, or does it reflect the product's actual identity? Flag generic patterns explicitly.
6. **Accessibility basics**: Color contrast, text sizing, touch target size (44px+), whether interaction relies on color alone.

**Delivery style**: Always frame feedback as:
`What's working` → `What's not` → `Why it matters` → `Concrete fix`. Prioritize 2–3 highest-impact issues rather than an exhaustive list.

---

## 2. UX Copy
For any button, error message, empty state, tooltip, or onboarding text:
- **Clarity over cleverness**: The user should know exactly what happens next.
- **Say what happened + what to do about it**: For errors, state the problem, cause (if known), and concrete next step.
- **Match voice to context**: Serious for billing/account errors, warmer for empty/first-use states.
- **Front-load the verb in CTAs**: e.g., "Send message" instead of "Message will be sent when you click here".
- **Avoid ambiguity in confirmations**: Explicitly state what is being confirmed and consequences if destructive.
- **Standalone test**: Copy must make sense with zero surrounding context.

---

## 3. Design System Audit
When auditing or building components/tokens:
1. Inventory what exists vs. what is actually used in the live product (flag drift).
2. Enforce naming consistency (e.g. semantic tokens vs raw values).
3. Identify hardcoded values that should be tokens (repeated 3+ times).
4. Ensure components have documented variants, interactive states (default/hover/active/disabled/error/focus), and accessibility notes.
5. Flag gaps where repeating patterns have no documented component.

---

## 4. Spec / PRD Writing
Structure all specs and PRDs with:
- **Problem statement**: What's broken or missing, for whom, evidence.
- **Goals / Non-goals**: Explicitly define what is NOT covered.
- **Success metrics**: Quantifiable indicators of success.
- **User flows / Requirements**: User-facing behavior and requirements.
- **Edge cases**: Enumerate explicitly.
- **Acceptance criteria**: Testable "Given X, when Y, then Z" statements.
- **Phasing**: MVP cut vs deferred items with rationale.
- Keep scannable: Headers, short bullets over prose blocks.

---

## 5. Roadmap Planning
- Structure as **Now / Next / Later**.
- Tie every initiative to a metric or goal.
- Zero-sum discipline: When adding something new, state what gets deprioritized.
- Flag dependencies (blockers).
- Distinguish committed work from exploratory bets.


---

## 6. Rheodemy Monetization & Pricing Architecture (Decided)

### A. Hybrid Tiered Model
- **Creator Autonomy**: Instructors select from platform-approved base price bands based on course depth and length (e.g., Tier 1 Primer, Tier 2 Core, Tier 3 Masterclass, Tier 4 Certification). Open arbitrary numbers are avoided to preserve predictable per-second streaming rates.
- **Platform-Controlled Promotions**: Platform manages seasonal sales, course bundles, and regional marketing discounts.
- **Purchasing Power Parity (PPP)**: Platform automatically handles local currency conversion and regional pricing parity across Africa (NGN, KES, GHS, ZAR, etc.) so creators never have to calculate volatile FX rates manually.

### B. Micropayment Streaming & Caps
- Every tier defines a mathematically clean per-second stream rate and a **rent-to-own price cap**.
- When accumulated per-second micropayments reach the creator-selected tier cap, the course is permanently unlocked for the learner at ₦0 ongoing charge.
- Rewatching, pausing, and buffering are always ₦0.
- First 2 minutes of every lesson are free.

### C. Revenue Share & Bursary Split
- **80%** directly to Creator.
- **15%** to Rheodemy platform & streaming infrastructure.
- **5%** to Rheodemy Bursary Fund (sponsoring student starter grants and emerging market access).

### D. Starter Credits Policy (Current Status: In Demo Review)
- Tested with ₦1,200 non-withdrawable starting learning grant to eliminate day-1 onboarding friction. Pending final team sign-off before production freeze.
