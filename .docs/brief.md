# Homeown Calculator – Development Brief
## calc.homeown.ie

This document is the **single source of truth** for the Homeown calculator.
All product intent, scope, calculations, UX principles, and delivery expectations are defined here.

If something is unclear, **default to the intent expressed in this document**.

---

## 1. Purpose

This calculator exists to answer one question honestly and clearly:

**Am I moving fast enough to catch the deposit for the home I want — or is the goalpost moving away from me?**

It gives users something valuable **for free**:
- clarity,
- relief from self-blame,
- and a realistic understanding of where they stand.

This is a **diagnostic tool**, not a recommendation engine and not a sales funnel.

---

## 2. What this calculator IS

- A **reality check** for prospective buyers (not renters only)
- A **time-based simulation** of savings vs a moving deposit target
- A **non-judgemental explainer** of structural affordability constraints
- A **pre-qualification insight tool**, not a lender proxy

---

## 3. What this calculator IS NOT

The calculator must never:
- tell users what they “should” do
- imply mortgage approval or eligibility
- guarantee outcomes
- recommend products
- compare pathways (e.g. “current vs Homeown”)
- use sales or marketing language

If in doubt: **explain, don’t persuade**.

---

## 4. Hosting & Deployment

- Static React app deployed via **GitHub Pages**
- Published at **https://calc.homeown.ie**
- Single route `/` only
- Built with Vite, React, TypeScript
- UI: Tailwind + shadcn/ui
- No backend, no tracking required for v1

---

## 5. Language & Tone Guardrails

**Approved language**
- deposit target
- moving goalpost
- catch / fall behind
- rule-of-thumb
- indicative only
- under current assumptions

**Banned language**
- deposit free
- earn
- guaranteed
- approved / qualify
- build equity
- own / ownership claims

Style rules:
- UK English
- calm, factual, non-judgemental
- no imperatives (“you should”)
- clarity > optimism

---

## 6. Core Inputs

### 6.1 Target & Deposit Context
- Target property price (today) – required
- Deposit % (default 10%, options: 10 / 15 / 20)  
  Deposit % applies consistently to today’s deposit and projected deposit at catch time.
- Current savings (today)
- Monthly savings contribution

### 6.2 Monthly Picture
- Gross household income (annual)
- Net monthly income
- Need expenses (monthly)
- Want expenses (monthly)

Derived:
- Disposable = net − needs − wants
- Warning (non-blocking) if monthly savings > disposable

### 6.3 Market Assumptions (sliders)
- Inflation rate (annual %) – default 3.0%
- Property price appreciation (annual %) – default 5.0%

### 6.4 Age & Mortgage Context
- User age (years)
- Mortgage interest rate (annual %)
- Mortgage term (suggested + user-adjustable)

---

## 7. Outputs

### 7.1 Deposit Catch Result
Always show:
- Deposit target today
- Catch verdict:
  - “You catch the deposit in X years Y months.”
  - OR “At this saving rate, you never catch the deposit (within a 40-year horizon).”

If catchable:
- Projected property value at catch
- Projected deposit target at catch
- Total savings at catch

### 7.2 Age Output
- “You’ll be {ageAtCatch} when you catch the deposit.”

If never:
- “Not reached within a 40-year horizon under your assumptions.”

---

## 8. Verdict Buckets (Sensitive & Informative)

Verdicts are **computed**, not user-selected.

Buckets:
1. Unlikely to afford (income vs target mismatch)
2. Deposit gap (income broadly ok, deposit is blocker)
3. On track: ≤ 5 years
4. On track: > 5 years
5. Will never reach deposit (under current assumptions)

### Affordability proxy (rule-of-thumb)
- Approx max mortgage ≈ **4 × gross annual income**
- Approx max affordable price ≈ max mortgage + reachable deposit
- If target property price materially exceeds this → “Unlikely to afford”

This is indicative only and must be labelled as such in the UI.

Display verdicts as a **meter or segmented bar**, with one highlighted bucket and a short explanation.

---

## 9. Mortgage Guidance (Conditional)

Mortgage outputs are shown **only if the deposit is reachable**.

Rules:
- Suggested max mortgage end age: 70 (configurable, indicative)
- Max term: min(35, 70 − ageAtCatch)
- Min term: 5 years (warn if less)

Mortgage principal:
- Property value at catch − deposit at catch

Monthly repayment:
- Standard amortisation
- Adjustable interest rate and term
- Label clearly as “indicative only – lender policies vary”

---

## 10. Calculation Model

### 10.1 Time Model
- Monthly simulation
- Horizon: 40 years (480 months)

### 10.2 Rates
- Monthly property growth:
  gp = (1 + rp)^(1/12) − 1
- Monthly inflation:
  gi = (1 + ri)^(1/12) − 1

### 10.3 Property & Deposit
- Property value at t:
  Pt = P0 × (1 + gp)^t
- Deposit target:
  Dt = depositPct × Pt
- Deposit in today’s euros:
  D_real_t = Dt / (1 + gi)^t

### 10.4 Savings (today’s euros)
- Initial savings: S0
- Monthly savings: S

Inflation is applied by discounting the purchasing power of savings over time
(real terms), not by automatically reducing the user’s stated monthly savings.

- Cumulative real savings:
  C_t = S0 + Σ ( S / (1 + gi)^k )

### 10.5 Catch Condition
Find earliest t where:
- C_t ≥ D_real_t

If no t ≤ 480 → “never”.

---

## 11. UX Structure

Single-page layout using shadcn/ui Cards:

1. Your target
2. Your monthly picture
3. Assumptions
4. Results (dynamic states)

Results should only compute when these are present:
- target property price
- current savings
- monthly savings
- inflation rate
- property appreciation rate

Age and mortgage outputs compute only once deposit reachability is known.

Result states:
- Incomplete inputs
- Warning (e.g. savings > disposable)
- Catchable
- Never

Warnings never block calculation.

---

## 12. Edge Cases (Expected Behaviour)

- Savings = 0 → always “never”
- Property appreciation = 0 → savings vs inflation only
- Inflation = 0 → savings retain real value
- Age-at-catch > max mortgage end age → mortgage warning
- Monthly savings > disposable → warn, do not block

---

## 13. Build Sequence (Feature-by-Feature)

Each feature ends with a commit pushed to GitHub for review.

1. App scaffold + shadcn layout
2. Target inputs + state
3. Monthly picture + warnings
4. Assumption sliders
5. Core deposit simulation
6. Age-at-catch output
7. Verdict bucket meter
8. Mortgage term suggestion
9. Mortgage repayment calc
10. Persistence + reset
11. GH Pages deployment to calc.homeown.ie

---

## 14. Definition of Done

- No broken or NaN states
- Results update instantly
- Clear “never” vs “catch” logic
- Mortgage only appears when valid
- Mobile-friendly
- Language complies with guardrails
- Deployed correctly to calc.homeown.ie

---

## 15. Future Enhancements (Out of Scope v1)

- Postcode → average property price autofill
- Scenario comparison
- Save/share results
- Accessibility audit
- Localisation

---

## Final Principle

This calculator must **explain reality without judgement**.

If a user leaves understanding *why* they feel stuck — even if the answer is uncomfortable — the product has succeeded.
