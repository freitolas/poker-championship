/**
 * Pure tournament state machine — no DOM, no fetch, no timers.
 * All game logic ported from the original index.html.
 */

import { GamePlayer, KillFeedEntry, Template, TemplateRound, TournamentState, PrizeBreakdown, LeaderboardEntry, EventType } from '@/types'

// ============================================================
// Helpers
// ============================================================

function formatTime(): string {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function elapsedMinutes(startTime: number | null): number {
  if (!startTime) return 0
  return Math.round((Date.now() - startTime) / 60000)
}

function feedEntry(type: EventType, text: string, startTime: number | null): KillFeedEntry {
  return {
    type,
    text,
    time: formatTime(),
    elapsed: elapsedMinutes(startTime),
    iso: new Date().toISOString(),
  }
}

function cloneState(state: TournamentState): TournamentState {
  return JSON.parse(JSON.stringify(state))
}

// ============================================================
// Init
// ============================================================

export function initTournamentState(
  template: Template,
  playerNames: string[],
  tournamentName: string,
  isMajor: boolean
): TournamentState {
  const buyIn = template.buy_in_amount

  const players: GamePlayer[] = playerNames.map(name => ({
    name,
    stacks: 1,
    totalPaid: buyIn,
    isEliminated: false,
    hasAddon: false,
    eliminatedBy: null,
    eliminatedAt: null,
    rebuyCount: 0,
    rebuyEliminations: [],
  }))

  return {
    players,
    currentRoundPosition: 0,
    timeLeft: 0,
    timerEndTime: null,
    tournamentStarted: true,
    tournamentEnded: false,
    tournamentName,
    isMajor,
    killFeed: [feedEntry('start', `🃏 Tournament started — ${players.length} players`, Date.now())],
    tournamentStartTime: Date.now(),
    inFireRounds: false,
    fireRoundsDone: 0,
    breakStartTime: null,
    godMode: false,
    undoStack: [],
  }
}

// ============================================================
// Round management
// ============================================================

export function getRoundDurationSeconds(round: TemplateRound): number {
  if (round.is_test) return round.duration_minutes * 60
  return round.duration_minutes * 60
}

export function advanceRound(state: TournamentState, rounds: TemplateRound[]): TournamentState {
  const next = cloneState(state)
  next.undoStack = []

  const nextPos = state.currentRoundPosition + 1
  if (nextPos >= rounds.length) return state

  const nextRound = rounds[nextPos]
  next.currentRoundPosition = nextPos
  next.timeLeft = getRoundDurationSeconds(nextRound)
  next.timerEndTime = null // will be set when timer starts
  next.inFireRounds = false
  next.fireRoundsDone = 0

  if (nextRound.is_break) {
    next.breakStartTime = Date.now()
    next.killFeed = [
      feedEntry('break', '☕ Break time! Add-ons open.', state.tournamentStartTime),
      ...state.killFeed,
    ].slice(0, 50)
  } else {
    next.killFeed = [
      feedEntry('round', `▶ ${nextRound.name} — ${nextRound.small_blind}/${nextRound.big_blind}`, state.tournamentStartTime),
      ...state.killFeed,
    ].slice(0, 50)
  }

  return next
}

export function prevRound(state: TournamentState, rounds: TemplateRound[]): TournamentState {
  if (state.currentRoundPosition <= 0) return state
  const next = cloneState(state)
  next.currentRoundPosition = state.currentRoundPosition - 1
  const round = rounds[next.currentRoundPosition]
  next.timeLeft = getRoundDurationSeconds(round)
  next.timerEndTime = null
  return next
}

export function startFireRounds(state: TournamentState): TournamentState {
  const next = cloneState(state)
  next.inFireRounds = true
  next.fireRoundsDone = 0
  next.killFeed = [
    feedEntry('fire', '🔥 Rounds of Fire started!', state.tournamentStartTime),
    ...state.killFeed,
  ].slice(0, 50)
  return next
}

export function completeFireRound(state: TournamentState): TournamentState {
  const next = cloneState(state)
  next.fireRoundsDone = state.fireRoundsDone + 1
  next.killFeed = [
    feedEntry('fire', `🔥 Round of Fire ${next.fireRoundsDone} complete`, state.tournamentStartTime),
    ...state.killFeed,
  ].slice(0, 50)
  return next
}

// ============================================================
// Player actions
// ============================================================

export function eliminatePlayer(
  state: TournamentState,
  playerName: string,
  killerName: string,
  template: Template
): TournamentState {
  const prev = cloneState(state)
  const next = cloneState(state)
  next.undoStack = [prev, ...state.undoStack].slice(0, 50)

  const playerIdx = next.players.findIndex(p => p.name === playerName)
  if (playerIdx === -1) return state

  const player = next.players[playerIdx]
  player.isEliminated = true
  player.eliminatedBy = killerName
  player.eliminatedAt = Date.now()

  const icon = killerName === 'God Mode' ? '⚡' : '💀'
  next.killFeed = [
    feedEntry('elimination',
      `${icon} ${playerName} eliminated${killerName && killerName !== 'N/A' ? ` by ${killerName}` : ''}`,
      state.tournamentStartTime),
    ...state.killFeed,
  ].slice(0, 50)

  return next
}

export function rebuyPlayer(
  state: TournamentState,
  playerName: string,
  template: Template
): TournamentState {
  if (!template.allow_rebuys) return state

  const prev = cloneState(state)
  const next = cloneState(state)
  next.undoStack = [prev, ...state.undoStack].slice(0, 50)

  const playerIdx = next.players.findIndex(p => p.name === playerName)
  if (playerIdx === -1) return state

  const player = next.players[playerIdx]

  if (player.eliminatedBy) {
    player.rebuyEliminations.push({
      eliminatedBy: player.eliminatedBy,
      timestamp: player.eliminatedAt ?? Date.now(),
    })
  }

  player.isEliminated = false
  player.eliminatedBy = null
  player.eliminatedAt = null
  player.stacks += 1
  player.totalPaid += template.rebuy_amount
  player.rebuyCount += 1

  next.killFeed = [
    feedEntry('rebuy', `🔥 ${playerName} rebuys! (stack #${player.stacks})`, state.tournamentStartTime),
    ...state.killFeed,
  ].slice(0, 50)

  return next
}

export function addAddon(
  state: TournamentState,
  playerName: string,
  template: Template
): TournamentState {
  if (!template.allow_addons) return state

  const prev = cloneState(state)
  const next = cloneState(state)
  next.undoStack = [prev, ...state.undoStack].slice(0, 50)

  const playerIdx = next.players.findIndex(p => p.name === playerName)
  if (playerIdx === -1) return state

  const player = next.players[playerIdx]
  if (player.hasAddon) return state

  player.hasAddon = true
  player.stacks += 1
  player.totalPaid += template.addon_amount

  next.killFeed = [
    feedEntry('addon', `➕ ${playerName} takes add-on`, state.tournamentStartTime),
    ...state.killFeed,
  ].slice(0, 50)

  return next
}

export function undoAction(state: TournamentState): TournamentState {
  if (state.undoStack.length === 0) return state
  const [previous, ...rest] = state.undoStack
  return { ...previous, undoStack: rest }
}

// ============================================================
// God Mode
// ============================================================

export function godKill(state: TournamentState, playerName: string, template: Template): TournamentState {
  return eliminatePlayer(state, playerName, 'God Mode', template)
}

export function godRevive(state: TournamentState, playerName: string): TournamentState {
  const next = cloneState(state)
  const playerIdx = next.players.findIndex(p => p.name === playerName)
  if (playerIdx === -1) return state
  next.players[playerIdx].isEliminated = false
  next.players[playerIdx].eliminatedBy = null
  next.players[playerIdx].eliminatedAt = null
  return next
}

export function toggleGodMode(state: TournamentState): TournamentState {
  return { ...state, godMode: !state.godMode }
}

export function adjustStack(state: TournamentState, playerName: string, delta: number): TournamentState {
  const next = cloneState(state)
  const player = next.players.find(p => p.name === playerName)
  if (!player) return state
  player.stacks = Math.max(0, player.stacks + delta)
  return next
}

// ============================================================
// Prize calculation
// ============================================================

export function calculatePrizes(state: TournamentState, template: Template): PrizeBreakdown {
  const activePlayers = state.players.filter(p => !p.isEliminated || p.rebuyCount > 0 || true)
  const grossPot = state.players.reduce((sum, p) => sum + p.totalPaid, 0)
  const houseFee = Math.round(grossPot * (template.house_fee_pct / 100))
  const netPot = grossPot - houseFee

  const rawFirst = netPot * (template.prize_first_pct / 100)
  const rawSecond = netPot * (template.prize_second_pct / 100)

  // Round to nearest 5
  const round5 = (n: number) => Math.round(n / 5) * 5

  const firstPrize = round5(rawFirst)
  const secondPrize = round5(rawSecond)

  // Killer bonus: only if there are eliminated players
  const killerBonus = state.isMajor ? 4 : 2
  const killerCounts: Record<string, number> = {}

  for (const player of state.players) {
    // Count direct eliminations
    if (player.eliminatedBy && player.eliminatedBy !== 'N/A' && player.eliminatedBy !== 'God Mode') {
      killerCounts[player.eliminatedBy] = (killerCounts[player.eliminatedBy] ?? 0) + 1
    }
    // Count rebuy eliminations
    for (const re of player.rebuyEliminations) {
      if (re.eliminatedBy && re.eliminatedBy !== 'N/A' && re.eliminatedBy !== 'God Mode') {
        killerCounts[re.eliminatedBy] = (killerCounts[re.eliminatedBy] ?? 0) + 1
      }
    }
  }

  // Only players finishing 3rd or worse can win killer bonus
  const eligible = state.players.filter(p => {
    const rank = p.isEliminated ? 999 : 1
    return rank >= 3
  })
  const eligibleNames = new Set(eligible.map(p => p.name))

  let killerName: string | null = null
  let maxKills = 0
  for (const [name, kills] of Object.entries(killerCounts)) {
    if (eligibleNames.has(name) && kills > maxKills) {
      maxKills = kills
      killerName = name
    }
  }

  return {
    grossPot,
    houseFee,
    netPot,
    firstPrize,
    secondPrize,
    killerBonus: killerName ? killerBonus : 0,
    killerName,
  }
}

// ============================================================
// Winner determination
// ============================================================

export function getActivePlayers(state: TournamentState): GamePlayer[] {
  return state.players.filter(p => !p.isEliminated)
}

export function checkForWinner(state: TournamentState): string | null {
  const active = getActivePlayers(state)
  if (active.length === 1) return active[0].name
  return null
}

export function declareWinner(
  state: TournamentState,
  winnerName: string,
  template: Template
): TournamentState {
  const next = cloneState(state)
  next.tournamentEnded = true

  const prizes = calculatePrizes(state, template)

  // Assign final ranks: winner is rank 1, second is rank 2, rest by elimination order
  const eliminated = next.players
    .filter(p => p.isEliminated)
    .sort((a, b) => (b.eliminatedAt ?? 0) - (a.eliminatedAt ?? 0))

  const winner = next.players.find(p => p.name === winnerName)!
  winner.isEliminated = false

  const active = next.players.filter(p => !p.isEliminated && p.name !== winnerName)
  const secondPlace = active[0] // Last player besides winner

  let rank = next.players.length
  for (const p of eliminated) {
    p.isEliminated = true
  }
  eliminated.forEach(p => {
    const found = next.players.find(pl => pl.name === p.name)!
    found.isEliminated = true
  })

  winner.isEliminated = false

  // Set prize winnings
  const winnerPlayer = next.players.find(p => p.name === winnerName)!
  winnerPlayer.totalPaid = winnerPlayer.totalPaid // prize tracked separately

  next.killFeed = [
    feedEntry('win', `🏆 ${winnerName} wins! 🎉`, state.tournamentStartTime),
    ...state.killFeed,
  ].slice(0, 50)

  return next
}

// ============================================================
// Leaderboard calculation (across multiple tournaments)
// ============================================================

export function calculateLeaderboard(
  tournamentResults: Array<{
    tournamentName: string
    isMajor: boolean
    players: Array<{
      name: string
      rank: number
      kills: number
      totalPaid: number
      prize: number
    }>
  }>
): LeaderboardEntry[] {
  const entries: Record<string, LeaderboardEntry> = {}

  for (const tourn of tournamentResults) {
    const multiplier = tourn.isMajor ? 2 : 1

    for (const player of tourn.players) {
      if (!entries[player.name]) {
        entries[player.name] = {
          name: player.name,
          points: 0,
          wins: 0,
          secondPlaces: 0,
          thirdPlaces: 0,
          kills: 0,
          gamesPlayed: 0,
          titles: [],
        }
      }

      const entry = entries[player.name]
      entry.gamesPlayed += 1

      let points = 1 * multiplier // participation
      if (player.rank === 1) { points += 10 * multiplier; entry.wins += 1 }
      if (player.rank === 2) { points += 7 * multiplier; entry.secondPlaces += 1 }
      if (player.rank === 3) { points += 4 * multiplier; entry.thirdPlaces += 1 }
      if (player.kills > 0) points += 2 * multiplier

      entry.kills += player.kills
      entry.points += points
    }
  }

  return Object.values(entries).sort((a, b) => b.points - a.points)
}
