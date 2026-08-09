import { Tournament, TournamentPlayer, TournamentEvent } from '@/types'

export const NARRATION_SYSTEM_PROMPT = `You are the legendary voice of the Poker Chronicle — a dramatic, witty, and impossibly entertaining sports commentator who has seen every bluff, bad beat, and miracle river card in the history of the game.

Your job is to write a hilarious, dramatic narrative recap of the night's poker tournament. Think of it as a cross between a sports highlight reel, a true crime documentary, and a pub quiz anecdote.

Style guidelines:
- Write 400-600 words
- Use actual player names extensively — they're the stars of this show
- Infer rivalries, storylines and character arcs from the data (e.g., if X eliminated Y twice, they're mortal enemies now)
- Make jokes about early exits, bad luck, and reckless play
- Celebrate comebacks (players who rebought and did well)
- Mock (affectionately) anyone who went out first
- Highlight the chip leader's dominance or the underdog's journey
- Reference specific round numbers and times to make it feel real
- Use poker terminology naturally (bad beat, monster pot, all-in, river card, etc.)
- End with a dramatic conclusion declaring the champion worthy (or lucky — whichever is funnier)
- Format with a punchy title, then flowing paragraphs (no bullet points)
- Be funny above all else`

export function buildNarrationPrompt(
  tournament: { name: string; is_major: boolean; started_at: string | null; ended_at: string | null },
  events: TournamentEvent[],
  players: TournamentPlayer[]
): string {
  const date = tournament.started_at
    ? new Date(tournament.started_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Unknown date'

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.final_rank && b.final_rank) return a.final_rank - b.final_rank
    if (a.final_rank) return -1
    if (b.final_rank) return 1
    return 0
  })

  const playerSummaries = sortedPlayers.map(p => {
    const parts = [`${p.name}: rank #${p.final_rank ?? '?'}`]
    if (p.rebuy_count > 0) parts.push(`${p.rebuy_count} rebuy(s)`)
    if (p.has_addon) parts.push('took add-on')
    if (p.prize_won > 0) parts.push(`won £${(p.prize_won / 100).toFixed(0)}`)
    if (p.stacks > 1) parts.push(`${p.stacks} stacks bought`)
    if (p.eliminated_by) parts.push(`eliminated by ${p.eliminated_by}`)
    return parts.join(', ')
  }).join('\n')

  const eventLog = events
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(e => {
      const mins = e.elapsed_minutes ? `[${Math.round(e.elapsed_minutes)}min]` : ''
      switch (e.event_type) {
        case 'elimination':
          return `${mins} ELIMINATED: ${e.player_name} (by ${e.actor_name ?? 'unknown'})`
        case 'rebuy':
          return `${mins} REBUY: ${e.player_name} came back from the dead`
        case 'addon':
          return `${mins} ADD-ON: ${e.player_name} topped up during break`
        case 'break':
          return `${mins} BREAK TIME`
        case 'round':
          return `${mins} ${e.metadata?.round_name ?? 'New round'} started`
        case 'fire':
          return `${mins} ROUND OF FIRE: ${e.metadata?.fire_round ?? ''}`
        case 'win':
          return `${mins} WINNER: ${e.player_name} claimed victory!`
        default:
          return `${mins} ${e.event_type}: ${e.player_name ?? ''}`
      }
    })
    .join('\n')

  // Find interesting stats
  const firstOut = events.find(e => e.event_type === 'elimination')
  const mostRebuys = players.reduce((a, b) => (a.rebuy_count > b.rebuy_count ? a : b), players[0])
  const winner = players.find(p => p.final_rank === 1)
  const totalPot = players.reduce((sum, p) => sum + p.total_paid, 0)

  const interestingFacts = [
    firstOut && `First player out: ${firstOut.player_name} (eliminated by ${firstOut.actor_name})`,
    mostRebuys?.rebuy_count > 0 && `Most rebuys: ${mostRebuys.name} (${mostRebuys.rebuy_count} times)`,
    winner && `Winner: ${winner.name} (prize: £${(winner.prize_won / 100).toFixed(0)})`,
    `Total pot: £${(totalPot / 100).toFixed(0)}`,
    tournament.is_major && 'This was a MAJOR tournament (double points)',
  ].filter(Boolean).join('\n')

  return `Write a dramatic, funny narrative recap of this poker tournament.

TOURNAMENT: ${tournament.name}
DATE: ${date}
${tournament.is_major ? 'TYPE: MAJOR CHAMPIONSHIP (double points, double bragging rights)' : 'TYPE: Regular game'}

PLAYER RESULTS:
${playerSummaries}

KEY FACTS:
${interestingFacts}

FULL EVENT LOG (chronological):
${eventLog}

Write the Chronicle now. Make it entertaining, use the players' names, infer storylines from the eliminations and rebuys, and give us a proper story of the night.`
}
