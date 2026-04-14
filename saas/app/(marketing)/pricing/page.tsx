'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const FREE_FEATURES = [
  '1 active tournament at a time',
  '6 pre-made tournament templates',
  'Up to 10 players in pool',
  'Timer, blinds & full game management',
  '1 free AI Narration chronicle',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited tournaments',
  'Unlimited custom templates',
  'Unlimited players in pool',
  'Smart home integrations (Hue, IFTTT, HA, Webhooks)',
  'Unlimited AI Narration chronicles',
  'Full leaderboard & lifetime stats',
  'Advanced customization (Rounds of Fire, prize splits, buy-ins)',
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleUpgrade(priceType: 'monthly' | 'annual') {
    setLoading(true)
    const priceId = priceType === 'monthly'
      ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      // Not logged in — redirect to register
      router.push('/register')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/" className="text-3xl font-black text-white">🃏 PokerHost</Link>
          <h1 className="text-4xl font-black text-white mt-6 mb-3">Simple, honest pricing</h1>
          <p className="text-stone-400 text-lg">Start free, upgrade when your game grows</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free */}
          <Card className="bg-stone-800 border-stone-700 text-white">
            <CardHeader>
              <Badge variant="secondary" className="w-fit bg-stone-700 text-stone-300">Free forever</Badge>
              <CardTitle className="text-2xl text-white">Free</CardTitle>
              <div className="text-4xl font-black text-white">£0</div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-stone-300">
                    <span className="text-green-400 shrink-0 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full mt-4 border-stone-600 text-stone-300 hover:bg-stone-700">
                  Get started free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="bg-gradient-to-br from-orange-500 to-amber-500 border-0 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-white text-orange-600">Most popular</Badge>
            </div>
            <CardHeader>
              <Badge className="w-fit bg-white/20 text-white border-0">Pro</Badge>
              <CardTitle className="text-2xl text-white">Pro</CardTitle>
              <div>
                <div className="text-4xl font-black text-white">£9<span className="text-xl font-normal">/month</span></div>
                <div className="text-sm text-orange-100">or £79/year (save 27%)</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-orange-50">
                    <span className="text-white shrink-0 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold"
                  onClick={() => handleUpgrade('monthly')}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Start Pro — £9/month'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-orange-100 hover:bg-white/10"
                  onClick={() => handleUpgrade('annual')}
                  disabled={loading}
                >
                  Annual — £79/year
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <p className="text-stone-400 text-sm">
            Questions? <a href="mailto:hello@pokerhost.app" className="text-orange-400 hover:text-orange-300">Get in touch</a>
          </p>
          <Link href="/dashboard" className="block mt-4 text-stone-500 text-xs hover:text-stone-400">
            ← Back to app
          </Link>
        </div>
      </div>
    </div>
  )
}
