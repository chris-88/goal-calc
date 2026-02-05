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
        outcomeSentence: 'Add your details to see whether the deposit is reachable.',
        timeToSave: 'Not reachable',
        supportingLine: '',
      }
    }

    if (parsedCurrentSavings >= depositToday) {
      return {
        label: 'Deposit saved',
        detail: 'Your current savings meet the 10% deposit required at today’s prices.',
        index: 3,
        outcomeSentence: 'You already have the required deposit.',
        timeToSave: 'Deposit already saved',
        supportingLine: 'Your current savings meet the 10% deposit required at today’s prices.',
      }
    }

    if (catchMonth === null) {
      return {
        label: 'Can’t save deposit',
        detail:
          'Even over a long time horizon, rising prices outpace monthly savings under these assumptions.',
        index: 0,
        outcomeSentence: 'At this saving rate, the deposit never catches up.',
        timeToSave: 'Not reachable',
        supportingLine:
          'At this saving rate and price growth, the deposit keeps moving out of reach.',
      }
    }

    if (catchMonth <= 60) {
      return {
        label: 'Will save deposit ≤ 5 years',
        detail: 'The deposit is reachable within five years under current assumptions.',
        index: 2,
        outcomeSentence: 'You’ll save the deposit within five years.',
        timeToSave: formatDuration(catchMonth),
        supportingLine: '',
      }
    }

    return {
      label: 'Will save deposit > 5 years',
      detail: 'The deposit is reachable, but it takes longer than five years at this saving pace.',
      index: 1,
      outcomeSentence: 'You’ll save the deposit, but it takes more than five years.',
      timeToSave: formatDuration(catchMonth ?? 0),
      supportingLine: '',
    }
  })()

  const depositAtCatchDisplay = depositAtCatch === null ? '—' : formatCurrency(depositAtCatch)
  const catchTimeDisplay = verdict.timeToSave

  const segments = [
    'Can’t save',
    '> 5 years',
    '≤ 5 years',
    'Deposit saved',
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Pathway Calculator
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              A calm reality check on saving a deposit
            </h1>
            <p className="text-sm text-muted-foreground">
              See whether your savings can catch a moving property market.
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Your starting point</CardTitle>
            <CardDescription>Adjust the sliders to reflect your situation today.</CardDescription>
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
              <p className="text-xs text-muted-foreground">
                Used only as a high-level sense check. Not a lending assessment.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Target property price (current market)</Label>
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
                <Label>Monthly savings (towards a deposit)</Label>
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
                How fast prices are rising in the areas you’re considering. Over the last 5 years, property appreciation has been between ~6-8%.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Your deposit reality</CardTitle>
            </div>
            <CardDescription>How long it takes to reach the deposit.</CardDescription>
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
                  {verdict.supportingLine ? (
                    <p className="mt-2 text-sm text-muted-foreground">{verdict.supportingLine}</p>
                  ) : null}
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
              <p className="text-sm text-muted-foreground">{verdict.outcomeSentence}</p>
              <div className="flex flex-wrap items-center gap-2">
              </div>
              <p className="text-sm text-muted-foreground">{verdict.detail}</p>
              <div className="grid grid-cols-4 gap-2">
                {segments.map((segment, index) => (
                  <div
                    key={segment}
                    className={`h-2 rounded-full ${
                      index === verdict.index ? 'bg-foreground' : 'bg-muted'
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
