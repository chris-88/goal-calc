import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-tide-50 text-ink-900">
      <div className="grain">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
              Homeown Calculator
            </p>
            <p className="text-sm text-ink-600">calc.homeown.ie</p>
          </div>
          <div className="rounded-full border border-ink-200/70 bg-white/80 px-4 py-2 text-xs text-ink-500">
            Diagnostic only · No recommendations
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16">
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-4xl leading-tight text-ink-900 sm:text-5xl">
                A calm reality check on whether your deposit can catch a moving
                goalpost.
              </h1>
              <p className="max-w-xl text-base text-ink-600">
                This tool compares your savings pace with a deposit target that rises
                alongside house prices. It aims to explain the gap without judgement,
                not to tell you what to do.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-ink-200/70 bg-white/80 px-4 py-2 text-sm text-ink-600">
                  UK English · EUR
                </div>
                <div className="rounded-2xl border border-ink-200/70 bg-white/80 px-4 py-2 text-sm text-ink-600">
                  Indicative only
                </div>
                <div className="rounded-2xl border border-ink-200/70 bg-white/80 px-4 py-2 text-sm text-ink-600">
                  No tracking
                </div>
              </div>
            </div>
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Once inputs are added, the calculator will show your catch time, age at
                  catch, and an indicative verdict meter.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-dashed border-ink-200/80 bg-ink-50/70 px-5 py-6 text-sm text-ink-500">
                  Results appear here when required inputs are present.
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Your target</CardTitle>
                <CardDescription>Property price and deposit target settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-36 rounded-2xl border border-dashed border-ink-200/80 bg-white/60" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your monthly picture</CardTitle>
                <CardDescription>Income, needs, wants, and savings pace.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-36 rounded-2xl border border-dashed border-ink-200/80 bg-white/60" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assumptions</CardTitle>
                <CardDescription>Inflation, price growth, and mortgage context.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-36 rounded-2xl border border-dashed border-ink-200/80 bg-white/60" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verdict meter</CardTitle>
                <CardDescription>
                  An indicative meter will highlight where you land today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-36 rounded-2xl border border-dashed border-ink-200/80 bg-white/60" />
              </CardContent>
            </Card>
          </section>

          <section className="rounded-3xl border border-ink-200/70 bg-white/80 p-6 text-sm text-ink-600 shadow-soft">
            <p className="font-medium text-ink-800">Rule-of-thumb only.</p>
            <p className="mt-2">
              This is not a lending decision. Mortgage limits and terms vary by lender,
              and results are based on the assumptions you provide.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
