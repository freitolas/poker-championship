'use client'

import { useState } from 'react'
import { SmartHomeProvider, SmartHomeConfig } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PROVIDERS: { id: SmartHomeProvider; label: string; icon: string; description: string }[] = [
  { id: 'webhook', label: 'Generic Webhooks', icon: '🔗', description: 'Custom HTTP endpoints for any service' },
  { id: 'ifttt', label: 'IFTTT', icon: '⚡', description: 'If This Then That automations' },
  { id: 'hue', label: 'Philips Hue', icon: '💡', description: 'Direct Hue bridge control' },
  { id: 'home_assistant', label: 'Home Assistant', icon: '🏠', description: 'HA webhook automations' },
]

const WEBHOOK_EVENTS = [
  { key: 'elimination_url', label: 'Elimination', description: 'Fired when a player is knocked out', example: '?value1=player&value2=killer' },
  { key: 'round_end_url', label: 'Round End', description: 'Fired when blinds increase' },
  { key: 'break_url', label: 'Break', description: 'Fired at the start of a break' },
  { key: 'winner_url', label: 'Winner', description: 'Fired when the tournament ends', example: '?value1=winner' },
]

const HA_EVENTS = [
  { key: 'elimination_webhook_id', label: 'Elimination Webhook ID' },
  { key: 'round_end_webhook_id', label: 'Round End Webhook ID' },
  { key: 'break_webhook_id', label: 'Break Webhook ID' },
  { key: 'winner_webhook_id', label: 'Winner Webhook ID' },
]

interface SmartHomeSettingsFormProps {
  existingConfig: SmartHomeConfig | null
}

export function SmartHomeSettingsForm({ existingConfig }: SmartHomeSettingsFormProps) {
  const [provider, setProvider] = useState<SmartHomeProvider>(existingConfig?.provider ?? 'webhook')
  const [config, setConfig] = useState<Record<string, string>>(
    (existingConfig?.config as Record<string, string>) ?? {}
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  function setField(key: string, value: string) {
    setConfig(c => ({ ...c, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()

    const payload = {
      user_id: user!.id,
      provider,
      config,
      updated_at: new Date().toISOString(),
    }

    const { error: err } = existingConfig
      ? await supabase.from('smart_home_configs').update(payload).eq('user_id', user!.id)
      : await supabase.from('smart_home_configs').insert(payload)

    if (err) setError(err.message)
    else setSaved(true)
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {/* Provider selector */}
      <Card>
        <CardHeader><CardTitle>Provider</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {PROVIDERS.map(p => (
              <label
                key={p.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  provider === p.id ? 'border-orange-400 bg-orange-50' : 'border-stone-200 hover:border-orange-200'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value={p.id}
                  checked={provider === p.id}
                  onChange={() => { setProvider(p.id); setSaved(false) }}
                  className="mt-0.5 accent-orange-500"
                />
                <div>
                  <div className="font-medium text-stone-800 text-sm flex items-center gap-1.5">
                    <span>{p.icon}</span> {p.label}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">{p.description}</div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook / IFTTT config */}
      {(provider === 'webhook' || provider === 'ifttt') && (
        <Card>
          <CardHeader>
            <CardTitle>{provider === 'ifttt' ? 'IFTTT Webhook URLs' : 'Webhook URLs'}</CardTitle>
            {provider === 'ifttt' && (
              <p className="text-xs text-stone-400">Format: https://maker.ifttt.com/trigger/EVENT/with/key/YOUR_KEY</p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {WEBHOOK_EVENTS.map(ev => (
              <div key={ev.key}>
                <label className="text-sm font-medium text-stone-700 block mb-1">
                  {ev.label}
                  {ev.example && <span className="ml-2 text-xs text-stone-400 font-normal">sends: {ev.example}</span>}
                </label>
                <Input
                  value={config[ev.key] ?? ''}
                  onChange={e => setField(ev.key, e.target.value)}
                  placeholder={`https://...`}
                />
                <p className="text-xs text-stone-400 mt-0.5">{ev.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Philips Hue config */}
      {provider === 'hue' && (
        <Card>
          <CardHeader><CardTitle>💡 Philips Hue</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">Bridge IP Address</label>
              <Input value={config.bridge_ip ?? ''} onChange={e => setField('bridge_ip', e.target.value)} placeholder="192.168.1.x" />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">API Username (from bridge pairing)</label>
              <Input value={config.username ?? ''} onChange={e => setField('username', e.target.value)} placeholder="Your Hue API username" />
              <p className="text-xs text-stone-400 mt-1">
                Get your username by pressing the bridge link button and calling /api on the bridge. Light effects are automatic if no scene is set.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">Light Group ID (optional, default: all)</label>
              <Input value={config.group_id ?? ''} onChange={e => setField('group_id', e.target.value)} placeholder="0" />
            </div>
            <div className="bg-stone-50 rounded-lg p-3 text-xs text-stone-500">
              <strong>Default light effects:</strong><br />
              Elimination: Red alert pulse · Round end: Orange flash · Break: Warm dim · Winner: Rainbow loop
            </div>
          </CardContent>
        </Card>
      )}

      {/* Home Assistant config */}
      {provider === 'home_assistant' && (
        <Card>
          <CardHeader><CardTitle>🏠 Home Assistant</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">Home Assistant URL</label>
              <Input value={config.ha_url ?? ''} onChange={e => setField('ha_url', e.target.value)} placeholder="https://homeassistant.local:8123" />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1">Long-Lived Access Token</label>
              <Input type="password" value={config.access_token ?? ''} onChange={e => setField('access_token', e.target.value)} placeholder="Your HA access token" />
            </div>
            {HA_EVENTS.map(ev => (
              <div key={ev.key}>
                <label className="text-sm font-medium text-stone-700 block mb-1">{ev.label}</label>
                <Input value={config[ev.key] ?? ''} onChange={e => setField(ev.key, e.target.value)} placeholder="webhook_id" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">{error}</div>}
      {saved && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-600 text-sm">✓ Settings saved!</div>}

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : '💾 Save Smart Home Settings'}
      </Button>
    </div>
  )
}
