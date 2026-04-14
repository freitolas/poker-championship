import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildNarrationPrompt, NARRATION_SYSTEM_PROMPT } from '@/lib/narration'
import { canUseNarration } from '@/lib/subscription'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tournamentId } = await request.json()
  if (!tournamentId) {
    return NextResponse.json({ error: 'Missing tournamentId' }, { status: 400 })
  }

  // Check subscription / narration gate
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, narration_used_free')
    .eq('id', user.id)
    .single()

  if (!profile || !canUseNarration(profile.subscription_tier as any, profile.narration_used_free)) {
    return NextResponse.json({ error: 'Upgrade to Pro for unlimited narrations' }, { status: 403 })
  }

  // Fetch tournament data
  const [{ data: tournament }, { data: players }, { data: events }] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', tournamentId).eq('user_id', user.id).single(),
    supabase.from('tournament_players').select('*').eq('tournament_id', tournamentId),
    supabase.from('tournament_events').select('*').eq('tournament_id', tournamentId).order('created_at'),
  ])

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
  }

  const prompt = buildNarrationPrompt(tournament, events ?? [], players ?? [])

  // Stream Claude response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: NARRATION_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        })

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(event.delta.text))
          }
        }

        // Mark free narration as used
        if (profile.subscription_tier !== 'pro') {
          await supabase
            .from('profiles')
            .update({ narration_used_free: true })
            .eq('id', user.id)
        }

        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
