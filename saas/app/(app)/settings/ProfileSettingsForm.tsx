'use client'

import { useState } from 'react'
import { Profile } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface ProfileSettingsFormProps {
  profile: Profile | null
  email: string
}

export function ProfileSettingsForm({ profile, email }: ProfileSettingsFormProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const isPro = profile?.subscription_tier === 'pro'

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ display_name: displayName, updated_at: new Date().toISOString() }).eq('id', user!.id)
    setSaved(true)
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Display Name</label>
            <Input value={displayName} onChange={e => { setDisplayName(e.target.value); setSaved(false) }} placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1">Email</label>
            <Input value={email} disabled className="bg-stone-50 text-stone-500" />
            <p className="text-xs text-stone-400 mt-1">Email cannot be changed here</p>
          </div>
          {saved && <p className="text-green-600 text-sm">✓ Saved!</p>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={isPro ? 'pro' : 'secondary'}>{isPro ? 'Pro ⭐' : 'Free'}</Badge>
              </div>
              <p className="text-stone-500 text-sm">
                {isPro ? 'You have access to all Pro features.' : 'Upgrade to unlock custom templates, smart home, and unlimited narrations.'}
              </p>
            </div>
            {!isPro && (
              <Link href="/pricing">
                <Button variant="pro" size="sm">Upgrade →</Button>
              </Link>
            )}
            {isPro && (
              <Link href="/settings/billing">
                <Button variant="outline" size="sm">Manage →</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
