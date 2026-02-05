import { useEffect, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

const STORAGE_KEY = 'homeown-calculator-v1-simple'

const DEFAULTS = {
  grossAnnualIncome: 60000,
  targetPropertyPrice: 240000,
  currentSavings: 0,
  monthlySavings: 400,
  propertyGrowthRate: 6,
}

const RANGES = {
  grossAnnualIncome: { min: 25_000, max: 150_000, step: 500 },
  targetPropertyPrice: { min: 0, max: 800_000, step: 5_000 },
  currentSavings: { min: 0, max: 100_000, step: 1_000 },
  monthlySavings: { min: 0, max: 2_000, step: 50 },
  propertyGrowthRate: { min: 3, max: 9, step: 0.5 },
}

function App() {
  const [grossAnnualIncome, setGrossAnnualIncome] = useState([DEFAULTS.grossAnnualIncome])
  const [targetPropertyPrice, setTargetPropertyPrice] = useState([DEFAULTS.targetPropertyPrice])
  const [currentSavings, setCurrentSavings] = useState([DEFAULTS.currentSavings])
  const [monthlySavings, setMonthlySavings] = useState([DEFAULTS.monthlySavings])
  const [propertyGrowthRate, setPropertyGrowthRate] = useState([DEFAULTS.propertyGrowthRate])

  const handleGrossIncomeChange = (value: number[]) => {
    const nextIncome = value[0] ?? 0
    setGrossAnnualIncome([nextIncome])
    setTargetPropertyPrice([nextIncome * 4])
  }

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const data = JSON.parse(stored) as Record<string, unknown>
      if (typeof data.grossAnnualIncome === 'number') {
        setGrossAnnualIncome([data.grossAnnualIncome])
      }
      if (typeof data.targetPropertyPrice === 'number') {
        setTargetPropertyPrice([data.targetPropertyPrice])
      }
      if (typeof data.currentSavings === 'number') {
        setCurrentSavings([data.currentSavings])
      }
      if (typeof data.monthlySavings === 'number') {
        setMonthlySavings([data.monthlySavings])
      }
      if (typeof data.propertyGrowthRate === 'number') {
        setPropertyGrowthRate([data.propertyGrowthRate])
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const payload = {
      grossAnnualIncome: grossAnnualIncome[0],
      targetPropertyPrice: targetPropertyPrice[0],
      currentSavings: currentSavings[0],
      monthlySavings: monthlySavings[0],
      propertyGrowthRate: propertyGrowthRate[0],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [grossAnnualIncome, targetPropertyPrice, currentSavings, monthlySavings, propertyGrowthRate])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value)

  const formatDuration = (months: number) => {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    const yearLabel = years === 1 ? 'year' : 'years'
    const monthLabel = remainingMonths === 1 ? 'month' : 'months'
    return `${years} ${yearLabel} ${remainingMonths} ${monthLabel}`
  }

  const parsedTargetPrice = targetPropertyPrice[0]
  const parsedGrossIncome = grossAnnualIncome[0]
  const parsedCurrentSavings = currentSavings[0]
  const parsedMonthlySavings = monthlySavings[0]
  const parsedGrowthRate = propertyGrowthRate[0]

  const hasRequiredInputs =
    parsedTargetPrice > 0 &&
    parsedGrossIncome > 0 &&
    parsedCurrentSavings >= 0 &&
    parsedMonthlySavings >= 0

  const depositPct = 0.1
  const monthlyGrowth = Math.pow(1 + parsedGrowthRate / 100, 1 / 12) - 1

  let depositToday: number | null = null
  let catchMonth: number | null = null
  let depositAtCatch: number | null = null

  if (hasRequiredInputs) {
    depositToday = parsedTargetPrice * depositPct

    for (let t = 0; t <= 480; t += 1) {
      const savings = parsedCurrentSavings + parsedMonthlySavings * t
      const depositTarget = depositToday * Math.pow(1 + monthlyGrowth, t)

      if (savings >= depositTarget) {
        catchMonth = t
        depositAtCatch = depositTarget
        break
      }
    }
  }

  const verdict = (() => {
    if (!hasRequiredInputs || depositToday === null) {
      return {
        label: 'Add inputs to calculate',
        detail: 'Enter all five fields to see your result.',
        index: 0,
        ruleOfThumb: false,
      }
    }

    if (parsedCurrentSavings >= depositToday) {
      return {
        label: 'Deposit saved',
        detail: 'Current savings already cover the 10% deposit required today.',
        index: 3,
        ruleOfThumb: false,
      }
    }

    if (catchMonth === null) {
      return {
        label: "Can't save deposit",
        detail: 'Not reached within the 40-year horizon under current assumptions.',
        index: 0,
        ruleOfThumb: false,
      }
    }

    const ruleTriggered = parsedTargetPrice > 4 * parsedGrossIncome + depositToday

    if (ruleTriggered) {
      return {
        label: 'Deposit saved!',
        detail: 'Rule-of-thumb only. This is not a lending decision.',
        index: 3,
        ruleOfThumb: true,
      }
    }

    if (catchMonth <= 60) {
      return {
        label: 'Will save deposit ≤ 5y',
        detail: 'Deposit is reachable within five years under current assumptions.',
        index: 2,
        ruleOfThumb: false,
      }
    }

    return {
      label: 'Will save deposit > 5y',
      detail: 'Deposit is reachable, but it takes more than five years.',
      index: 1,
      ruleOfThumb: false,
    }
  })()

  const highlightIndex =
    depositToday !== null && parsedCurrentSavings >= depositToday ? 3 : verdict.index

  const verdictLine = !hasRequiredInputs
    ? 'Verdict: Add the five inputs to calculate.'
    : catchMonth === null
      ? 'Verdict: You never catch the deposit (within 40 years).'
      : `Verdict: You catch the deposit in ${formatDuration(catchMonth)}.`

  const depositTodayDisplay = depositToday === null ? '—' : formatCurrency(depositToday)
  const depositAtCatchDisplay = depositAtCatch === null ? '—' : formatCurrency(depositAtCatch)
  const catchTimeDisplay = catchMonth === null ? 'Never' : formatDuration(catchMonth)

  const segments = [
    'Can’t save deposit',
    'Will save deposit > 5y',
    'Will save deposit ≤ 5y',
    'Deposit already saved',
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Pathway Calculator
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Your details</CardTitle>
            <CardDescription>Five inputs to calculate your deposit saving pathway.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Gross household income (annual)</Label>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(grossAnnualIncome[0])}
              </p>
              <Slider
                min={RANGES.grossAnnualIncome.min}
                max={RANGES.grossAnnualIncome.max}
                step={RANGES.grossAnnualIncome.step}
                value={grossAnnualIncome}
                onValueChange={handleGrossIncomeChange}
              />
            </div>

            <div className="space-y-3">
              <Label>Target property price (today)</Label>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(targetPropertyPrice[0])}
              </p>
              <Slider
                min={RANGES.targetPropertyPrice.min}
                max={RANGES.targetPropertyPrice.max}
                step={RANGES.targetPropertyPrice.step}
                value={targetPropertyPrice}
                onValueChange={setTargetPropertyPrice}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Label>Current savings (today)</Label>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(currentSavings[0])}
                </p>
                <Slider
                  min={RANGES.currentSavings.min}
                  max={RANGES.currentSavings.max}
                  step={RANGES.currentSavings.step}
                  value={currentSavings}
                  onValueChange={setCurrentSavings}
                />
              </div>
              <div className="space-y-3">
                <Label>Monthly savings</Label>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(monthlySavings[0])}
                </p>
                <Slider
                  min={RANGES.monthlySavings.min}
                  max={RANGES.monthlySavings.max}
                  step={RANGES.monthlySavings.step}
                  value={monthlySavings}
                  onValueChange={setMonthlySavings}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label>Property price appreciation (annual)</Label>
                <Badge variant="outline">{propertyGrowthRate[0].toFixed(1)}%</Badge>
              </div>
              <Slider
                min={RANGES.propertyGrowthRate.min}
                max={RANGES.propertyGrowthRate.max}
                step={RANGES.propertyGrowthRate.step}
                value={propertyGrowthRate}
                onValueChange={setPropertyGrowthRate}
              />
              <p className="text-sm text-muted-foreground">
                Property price appreciation over the last five years has been between ~6–8%.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Your deposit reality</CardTitle>
            </div>
            <CardDescription>Time to save the deposit and the target amount.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasRequiredInputs ? (
              <Alert>
                <AlertTitle>Enter all five inputs to see your results.</AlertTitle>
                <AlertDescription>
                  This is a diagnostic only and updates instantly as you adjust values.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Time to save
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{catchTimeDisplay}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Deposit required
                  </p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {depositAtCatchDisplay}
                  </p>
                </div>
              </>
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {verdict.ruleOfThumb ? (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Rule-of-thumb only
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{verdict.detail}</p>
              <div className="grid grid-cols-4 gap-2">
                {segments.map((segment, index) => (
                  <div
                    key={segment}
                    className={`h-2 rounded-full ${
                      index === highlightIndex ? 'bg-foreground' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {segments.map((segment) => (
                  <span key={segment}>{segment}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
