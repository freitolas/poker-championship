import { createClient } from '@/lib/supabase/server'
import { SmartHomeSettingsForm } from './SmartHomeSettingsForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SmartHomeSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: config }, { data: profile }] = await Promise.all([
    supabase.from('smart_home_configs').select('*').eq('user_id', user!.id).single(),
    supabase.from('profiles').select('subscription_tier').eq('id', user!.id).single(),
  ])

  const isPro = profile?.subscription_tier === 'pro'

  if (!isPro) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Smart Home</h1>
        <p className="text-stone-500 text-sm mb-6">Trigger lights, sounds, and automations during your game.</p>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🏠</div>
          <h2 className="font-bold text-stone-800 mb-2">Pro Feature</h2>
          <p className="text-stone-500 text-sm mb-4">
            Smart home integrations require a Pro subscription. Connect Philips Hue, IFTTT, Home Assistant, or any webhook endpoint.
          </p>
          <Link href="/pricing"><Button variant="pro" size="lg">⭐ Upgrade to Pro</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">Smart Home</h1>
      <p className="text-stone-500 text-sm mb-6">
        Trigger lights, sounds, and automations at eliminations, round changes, breaks, and when a winner is crowned.
      </p>
      <SmartHomeSettingsForm existingConfig={config} />
    </div>
  )
}
