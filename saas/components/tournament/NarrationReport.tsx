'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface NarrationReportProps {
  tournamentId: string
  canNarrate: boolean
  isPro: boolean
}

export function NarrationReport({ tournamentId, canNarrate, isPro }: NarrationReportProps) {
  const [narrative, setNarrative] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState(false)

  async function generateNarration() {
    setLoading(true)
    setError(null)
    setNarrative('')

    try {
      const res = await fetch('/api/narration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to generate narrative')
      }

      // Stream the response
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setNarrative(text)
      }

      setGenerated(true)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(narrative)
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📰 The Night&apos;s Chronicle
            {!isPro && <Badge variant="pro">Pro</Badge>}
          </CardTitle>
          {!isPro && !canNarrate && (
            <Link href="/pricing">
              <Button size="sm" variant="pro">Upgrade to Pro</Button>
            </Link>
          )}
          {!isPro && canNarrate && (
            <Badge variant="secondary" className="text-xs">1 free use</Badge>
          )}
        </div>
        <p className="text-xs text-stone-500">
          AI-generated dramatic narrative of tonight&apos;s game using the event log.
          {!isPro && ' Free users get one complimentary chronicle.'}
        </p>
      </CardHeader>
      <CardContent>
        {!canNarrate && !generated ? (
          <div className="text-center py-6">
            <p className="text-stone-500 text-sm mb-3">
              You&apos;ve used your free chronicle. Upgrade to Pro for unlimited AI-generated stories.
            </p>
            <Link href="/pricing">
              <Button variant="pro">⭐ Upgrade to Pro</Button>
            </Link>
          </div>
        ) : (
          <>
            {!narrative && !loading && (
              <div className="text-center py-6">
                <p className="text-stone-500 text-sm mb-4">
                  Generate a funny, dramatic retelling of tonight&apos;s poker game — rivalries, bad beats, comebacks, and all.
                </p>
                <Button onClick={generateNarration} className="bg-amber-500 hover:bg-amber-600 text-white">
                  ✨ Generate The Chronicle
                </Button>
              </div>
            )}

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  Writing your story...
                </div>
                {narrative && (
                  <div className="mt-3 prose prose-sm prose-stone max-w-none whitespace-pre-wrap text-stone-700 font-serif leading-relaxed">
                    {narrative}
                    <span className="animate-pulse">▊</span>
                  </div>
                )}
              </div>
            )}

            {narrative && !loading && (
              <div className="space-y-4">
                <div className="prose prose-sm prose-stone max-w-none whitespace-pre-wrap text-stone-700 font-serif leading-relaxed bg-white/60 rounded-lg p-4 border border-amber-100">
                  {narrative}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    📋 Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setNarrative(''); setGenerated(false) }}>
                    ↺ Regenerate
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {error}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
