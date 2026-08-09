import { createClient } from '@/lib/supabase/server'
import { stripe, createBillingPortalSession } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const isPro = profile?.subscription_tier === 'pro'

  let subscriptionPeriodEnd: number | null = null
  let subscriptionStatus: string | null = null
  if (profile?.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
      subscriptionStatus = sub.status
      subscriptionPeriodEnd = (sub as any).current_period_end ?? null
    } catch {}
  }

  const portalUrl = profile?.stripe_customer_id
    ? `/api/billing/portal`
    : null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Billing</h1>

      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant={isPro ? 'pro' : 'secondary'}>{isPro ? 'Pro ⭐' : 'Free'}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isPro ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-stone-500 text-xs">Status</div>
                  <div className="font-medium capitalize">{subscriptionStatus ?? 'active'}</div>
                </div>
                {subscriptionPeriodEnd && (
                  <div>
                    <div className="text-stone-500 text-xs">Renews</div>
                    <div className="font-medium">
                      {new Date(subscriptionPeriodEnd * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </div>
              <form action="/api/billing/portal" method="POST">
                <Button type="submit" variant="outline" className="w-full">
                  Manage Subscription →
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-stone-500 text-sm">You&apos;re on the free plan. Upgrade to Pro to unlock all features.</p>
              <Link href="/pricing">
                <Button variant="pro" className="w-full">⭐ Upgrade to Pro</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature comparison */}
      <Card>
        <CardHeader><CardTitle>Plan Features</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              { feature: 'Run tournaments', free: true, pro: true },
              { feature: 'Pre-made templates (6 included)', free: true, pro: true },
              { feature: 'Up to 10 players in pool', free: true, pro: false },
              { feature: 'Unlimited players', free: false, pro: true },
              { feature: '1 active tournament at a time', free: true, pro: false },
              { feature: 'Unlimited concurrent tournaments', free: false, pro: true },
              { feature: 'Custom tournament templates', free: false, pro: true },
              { feature: 'Smart home integrations', free: false, pro: true },
              { feature: 'Unlimited AI Narration chronicles', free: false, pro: true },
              { feature: '1 free AI narration', free: true, pro: false },
              { feature: 'Full leaderboard & lifetime stats', free: false, pro: true },
            ].map(({ feature, free, pro }) => (
              <div key={feature} className="flex items-center gap-4 py-1.5 border-b border-stone-50">
                <span className="flex-1 text-stone-700">{feature}</span>
                <span className={`w-12 text-center ${free ? 'text-green-500' : 'text-stone-300'}`}>{free ? '✓' : '—'}</span>
                <span className={`w-12 text-center ${pro ? 'text-green-500' : 'text-stone-300'}`}>{pro ? '✓' : '—'}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-stone-400">
            <span className="flex-1 text-right">Free</span>
            <span className="w-24 text-center">Pro</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
