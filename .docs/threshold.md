## Verdict Meter – Affordability Threshold (Deterministic Rule)

To make **Bucket 1 (“Unlikely to afford”)** deterministic and defensible, use the following rule-of-thumb affordability proxy.

### Affordability Proxy
- `maxMortgage = 4.0 × grossAnnualIncome`
- `reachableDeposit`:
  - If the deposit is catchable:  
    `reachableDeposit = depositAtCatch`
  - If the deposit is not catchable:  
    `reachableDeposit = min(currentSavings + (monthlySavings × 60), depositToday)`  
    (uses a conservative 5-year proxy so users are not classed as “unaffordable” purely due to a deposit blocker)

- `maxAffordablePrice = maxMortgage + reachableDeposit`
- `ratio = targetPropertyPrice / maxAffordablePrice`

### Bucket Rules

#### Bucket 1 – Unlikely to afford
- Assign **Bucket 1** if:  
  `ratio >= 1.20`

This means the target property price is at least **20% above** a simple affordability range based on income.

#### Borderline (soft warning, not a separate bucket)
- If:  
  `1.10 <= ratio < 1.20`

Do **not** assign Bucket 1.  
Instead, show a neutral note such as:

> “Your target price is above a simple rule-of-thumb affordability range. Small changes in income, price, or deposit assumptions can shift this.”

#### Other Buckets
- If `ratio < 1.20`, determine the verdict based on **deposit reachability and time-to-catch**:
  - Deposit catch ≤ 5 years → On track (≤ 5 years)
  - Deposit catch > 5 years → On track (> 5 years)
  - Deposit never catchable → Deposit gap / Will never reach deposit (as per existing rules)

### Copy Requirements
- All affordability outputs must be labelled **“rule-of-thumb only”**.
- Include a disclaimer such as:
  > “This is not a lending decision. Mortgage limits and terms vary by lender.”

### Edge Cases
- If `grossAnnualIncome <= 0` or not provided:
  - Do **not** compute Bucket 1.
  - Fall back to deposit-based buckets only.
  - Prompt the user to add gross income for an affordability estimate.
- Guard against divide-by-zero by ensuring `maxAffordablePrice > 0` before computing `ratio`.
