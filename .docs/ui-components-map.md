# UI Components Map (shadcn/ui)
## Homeown Calculator (calc.homeown.ie)

This document maps each part of the calculator UI to the **shadcn/ui components** to be used, so implementation is consistent, accessible, and reviewable.

Principles:
- Single-page, linear flow (no tabs).
- Results are persistent (avoid toasts).
- Warnings never block calculation.
- Keep it calm, minimal, mobile-first.

---

## 1) Global Page Shell

### Layout
- **Card**: one per major section
- **Separator**: light dividers inside cards where needed
- **Button**: reset defaults, optional “clear” actions (non-destructive styling)

Recommended structure:
- `<Card>` “Your target”
- `<Card>` “Your monthly picture”
- `<Card>` “Assumptions”
- `<Card>` “Results”
- `<Card>` “Mortgage estimate” (conditionally enabled / collapsible)

Components:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Separator`
- `Button`

---

## 2) Inputs: “Your target” Card

Fields:
- Target property price (today)
- Deposit % (10/15/20)
- Current savings (today)
- Monthly savings contribution

Components:
- `Label` + `Input` for currency fields
- `Select` for Deposit %
- Optional helper copy in `CardDescription` or small `<p>` text
- Optional `Tooltip` for “What is deposit %?”

Use:
- `Input` for:
  - targetPropertyPrice
  - currentSavings
  - monthlySavings
- `Select` for:
  - depositPct (options: 10%, 15%, 20%)

---

## 3) Inputs: “Your monthly picture” Card

Fields:
- Gross household income (annual)
- Net monthly income
- Need expenses (monthly)
- Want expenses (monthly)

Derived display:
- Disposable = net − needs − wants
- Warning if monthlySavings > disposable

Components:
- `Label` + `Input` for all fields
- `Alert` for warning state (non-blocking)
- Optional `Badge` for “Non-blocking warning” or “Check this number”

Use:
- `Input` for:
  - grossAnnualIncome
  - netMonthlyIncome
  - needExpenses
  - wantExpenses
- `Alert` (variant: `default` or `secondary`) for:
  - savings > disposable warning
  - missing gross income message (only if needed for affordability estimate)

---

## 4) Assumptions Card

Controls:
- Inflation rate (annual %)
- Property price appreciation (annual %)

Components:
- `Slider` for both rates
- `Label` for each slider
- Small live value text (e.g. “3.0%”)
- Optional `Tooltip`:
  - inflation explanation
  - appreciation explanation

Use:
- `Slider` for:
  - inflationRateAnnual (0–10, step 0.1)
  - propertyAppreciationAnnual (0–12, step 0.1)

---

## 5) Results Card

Outputs:
- Deposit target today
- Catch verdict:
  - Catchable: time to catch (years + months)
  - Never: never within 40-year horizon
- If catchable:
  - projected property value at catch
  - projected deposit at catch
  - total savings at catch
- Age at catch (if age provided and catchable)

Verdict bucket meter:
- One highlighted bucket + explanation

Components:
- `Alert` for primary verdict (catch/never)
- `Badge` for the active bucket label + “Indicative only” tags
- `Progress` for the verdict meter (composed)
- `Separator` between sections
- Optional `Tooltip` for “rule-of-thumb” affordability proxy

Recommended patterns:
- **Catchable**: `Alert` variant `default` (or `secondary`)
- **Never**: `Alert` variant `destructive` (keep copy calm)
- **Incomplete inputs**: `Alert` variant `secondary` with “Enter X to calculate”

Use:
- `Alert` for:
  - catch result
  - never result
  - incomplete inputs state
- `Progress` for:
  - Verdict meter base bar
- `Badge` for:
  - active verdict bucket
  - “Rule-of-thumb” label
- `Separator` for:
  - separating “Deposit result” and “Verdict / Mortgage”

---

## 6) Verdict Meter (Component: VerdictMeter.tsx)

Verdict buckets:
1. Unlikely to afford (income vs target mismatch)
2. Deposit gap (income broadly ok, deposit is blocker)
3. On track: ≤ 5 years
4. On track: > 5 years
5. Will never reach deposit (under current assumptions)

Components:
- `Progress` for the bar
- `Badge` for the active bucket label
- Optional small text lines below for explanation

Implementation guidance:
- Keep the meter deterministic and stable.
- Do not add animation beyond subtle transitions.
- No charts.

---

## 7) Mortgage Estimate (Card + Optional Collapsible)

Shown only when deposit is reachable; otherwise show disabled explanatory state.

Inputs:
- Age (years)
- Mortgage interest rate (annual %)
- Mortgage term (years) (suggested + user adjustable)

Outputs:
- Suggested max term (based on max mortgage end age)
- Indicative monthly repayment (amortisation)

Components:
- `Collapsible` (optional but recommended) to keep UI tidy
- `Label` + `Input` for age (if not collected earlier)
- `Slider` for mortgage interest rate
- `Slider` or `Select` for mortgage term
- `Alert` for:
  - mortgage section disabled state
  - age/term warnings (e.g. age too high for typical term)
- `Badge` for “Indicative only”

Use:
- `Collapsible` for:
  - mortgage section expand/collapse
- `Slider` for:
  - mortgageRateAnnual
  - mortgageTermYears (bounded)
- `Alert` for:
  - “Mortgage estimate available once deposit is reachable”
  - “Term limited by age” warnings

---

## 8) Reset / Persistence Controls

Actions:
- Reset to defaults
- (Optional) Clear saved inputs

Components:
- `Button` (variant: `secondary`) for reset
- Optional: `Alert` to confirm reset (avoid dialogs)

Use:
- `Button` for:
  - reset action in header or footer

---

## 9) Components We Are Deliberately Not Using

To maintain a calm, linear experience:
- `Tabs` (avoid non-linear navigation)
- `Toast` (results should persist; no transient feedback)
- `Dialog` / `Modal` (avoid interrupting flow)
- Charts / graph components (v1 should stay simple)

---

## 10) shadcn/ui Install List

Copy/paste:

```bash
npx shadcn-ui@latest add \
  card \
  input \
  slider \
  select \
  label \
  alert \
  badge \
  progress \
  separator \
  button \
  tooltip \
  collapsible
```
