import { useEffect, useState } from 'react'
import { Compass, Flag, Navigation } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

  const clampTargetPrice = (income: number, target: number) =>
    Math.min(target, income * 5)

  const handleGrossIncomeChange = (value: number[]) => {
    const nextIncome = value[0] ?? 0
    setGrossAnnualIncome([nextIncome])
    setTargetPropertyPrice([clampTargetPrice(nextIncome, nextIncome * 4)])
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

  const depositFloorPercent = 0.1
  const monthlyGrowth = Math.pow(1 + parsedGrowthRate / 100, 1 / 12) - 1

  const maxMortgage = parsedGrossIncome * 4
  const requiredDepositEuroToday =
    parsedTargetPrice > 0 ? Math.max(0, parsedTargetPrice - maxMortgage) : 0
  const requiredDepositPercentToday =
    parsedTargetPrice > 0 ? requiredDepositEuroToday / parsedTargetPrice : 0
  const depositPercentUsed = Math.max(depositFloorPercent, requiredDepositPercentToday)

  const bucket4Triggered = requiredDepositPercentToday > depositFloorPercent

  let depositToday: number | null = null
  let catchMonth: number | null = null
  let depositAtCatch: number | null = null

  if (hasRequiredInputs) {
    depositToday = parsedTargetPrice * depositPercentUsed

    for (let t = 0; t <= 480; t += 1) {
      const savings = parsedCurrentSavings + parsedMonthlySavings * t
      const depositTarget = parsedTargetPrice * depositPercentUsed * Math.pow(1 + monthlyGrowth, t)

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

    const depositAlreadySaved = parsedCurrentSavings >= depositToday
    const notReachable = catchMonth === null

    if (bucket4Triggered) {
      return {
        label: 'Target looks high vs income',
        detail: 'Rule-of-thumb only. This is not a lending decision.',
        index: 3,
        outcomeSentence: notReachable
          ? 'Target looks high vs income (rule-of-thumb). Not reachable under current assumptions.'
          : 'Target looks high vs income (rule-of-thumb).',
        timeToSave: depositAlreadySaved
          ? 'Deposit already saved'
          : notReachable
            ? 'Not reachable'
            : formatDuration(catchMonth ?? 0),
        supportingLine: depositAlreadySaved
          ? 'Your current savings meet the required deposit at today’s prices.'
          : notReachable
            ? 'At this saving rate and price growth, the deposit keeps moving out of reach.'
            : '',
      }
    }

    if (depositAlreadySaved) {
      return {
        label: 'Deposit saved',
        detail: 'Your current savings meet the 10% deposit required at today’s prices.',
        index: 3,
        outcomeSentence: 'You already have the required deposit.',
        timeToSave: 'Deposit already saved',
        supportingLine: 'Your current savings meet the 10% deposit required at today’s prices.',
      }
    }

    if (notReachable) {
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

    if (catchMonth !== null && catchMonth <= 60) {
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
  const depositPercentDisplay = `${(depositPercentUsed * 100).toFixed(0)}%`

  const monthsParam = catchMonth === null ? 'na' : `${catchMonth}`
  const tppParam = parsedTargetPrice ? `${parsedTargetPrice}` : ''
  const ghiParam = parsedGrossIncome ? `${parsedGrossIncome}` : ''

  type BucketKey = 'CANT_SAVE' | 'OVER_5Y' | 'UNDER_5Y' | 'DEPOSIT_SAVED' | 'INCOME_MISMATCH'

  const bucketKey: BucketKey = bucket4Triggered
    ? 'INCOME_MISMATCH'
    : verdict.timeToSave === 'Not reachable'
      ? 'CANT_SAVE'
      : verdict.timeToSave === 'Deposit already saved'
        ? 'DEPOSIT_SAVED'
        : catchMonth !== null && catchMonth <= 60
          ? 'UNDER_5Y'
          : 'OVER_5Y'

  const ctaVariants: Record<
    BucketKey,
    {
      headline: string
      body: string
      primaryLabel: string
      secondaryLabel?: string
      note?: string
    }
  > = {
    CANT_SAVE: {
      headline: 'You’re not falling behind — the goalpost is moving.',
      body:
        'When property prices rise faster than savings, the deposit target keeps moving away. Homeown is designed for this situation, allowing you to live in the home while building equity at a fixed purchase price.',
      primaryLabel: 'See how the Homeown pathway works',
      secondaryLabel: 'Talk to us about your situation',
      note: 'We’ll explain the structure clearly and tell you honestly whether it’s appropriate.',
    },
    OVER_5Y: {
      headline: 'You can get there — but the market stays in control.',
      body:
        'Even steady savers remain exposed to rising prices while building a deposit. Homeown fixes the purchase price upfront and converts monthly payments into pathway equity over time.',
      primaryLabel: 'Compare your current path with Homeown',
      secondaryLabel: 'Understand how the pathway works',
    },
    UNDER_5Y: {
      headline: 'You’re in a strong position.',
      body:
        'You may not need Homeown. Some people in this position still choose it to remove market risk while preparing for a mortgage.',
      primaryLabel: 'See when Homeown makes sense',
      secondaryLabel: 'When it doesn’t',
    },
    DEPOSIT_SAVED: {
      headline: 'You’ve done the hard part.',
      body:
        'If you’re not ready to buy immediately, Homeown can purchase the home and allow you to build further equity while preparing for a mortgage — at a fixed price.',
      primaryLabel: 'Learn how the Homeown pathway works',
      secondaryLabel: 'Buying now vs waiting',
    },
    INCOME_MISMATCH: {
      headline: 'The deposit is achievable — income is the constraint.',
      body:
        'When income limits mortgage size, the deposit requirement increases. Homeown can support deposit-ready but mortgage-limited clients through a structured pathway to ownership.',
      primaryLabel: 'Talk to Homeown',
      note: 'Rule-of-thumb only. We’ll explain what this means in practice.',
    },
  }

  const cta = ctaVariants[bucketKey]
  const ctaBaseUrl = '/talk-to-homeown'
  const ctaQuery = new URLSearchParams({
    bucket: bucketKey,
    months: monthsParam,
    ...(tppParam ? { tpp: tppParam } : {}),
    ...(ghiParam ? { ghi: ghiParam } : {}),
  }).toString()
  const ctaHref = `${ctaBaseUrl}?${ctaQuery}`

  const segments = [
    'Can’t save',
    '> 5 years',
    '≤ 5 years',
    bucket4Triggered ? 'Target looks high' : 'Deposit saved',
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
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Your starting point</CardTitle>
              <Navigation className="h-10 w-10 shrink-0 text-muted-foreground" aria-hidden="true" />
            </div>
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
                max={Math.min(RANGES.targetPropertyPrice.max, grossAnnualIncome[0] * 5)}
                step={RANGES.targetPropertyPrice.step}
                value={targetPropertyPrice}
                onValueChange={(value) =>
                  setTargetPropertyPrice([
                    clampTargetPrice(grossAnnualIncome[0], value[0] ?? 0),
                  ])
                }
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
              <Flag className="h-10 w-10 shrink-0 text-muted-foreground" aria-hidden="true" />
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
                    Deposit required {bucket4Triggered ? `(${depositPercentDisplay})` : ''}
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
                <Badge variant="secondary">{verdict.label}</Badge>
                {bucket4Triggered ? (
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
                      index === verdict.index ? '' : 'opacity-35'
                    }`}
                    style={{ backgroundColor: '#E7D4BB' }}
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

        <Card>
          <CardHeader>
            <p className="text-xs text-muted-foreground">
              Based on the inputs you entered above.
            </p>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{cta.headline}</CardTitle>
              <Compass className="h-10 w-10 shrink-0 text-muted-foreground" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{cta.body}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <a href={ctaHref}>{cta.primaryLabel}</a>
              </Button>
              {cta.secondaryLabel ? (
                <Button variant="ghost" asChild>
                  <a href={ctaHref}>{cta.secondaryLabel}</a>
                </Button>
              ) : null}
            </div>
            {cta.note ? (
              <p className="text-xs text-muted-foreground">{cta.note}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
