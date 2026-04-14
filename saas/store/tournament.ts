'use client'

import { create } from 'zustand'
import {
  TournamentState,
  Template,
  TemplateRound,
  SmartHomeConfig,
  GamePlayer,
} from '@/types'
import {
  eliminatePlayer,
  rebuyPlayer,
  addAddon,
  advanceRound,
  prevRound,
  startFireRounds,
  completeFireRound,
  toggleGodMode,
  godKill,
  godRevive,
  adjustStack,
  checkForWinner,
  declareWinner,
  undoAction,
  calculatePrizes,
  getActivePlayers,
  getRoundDurationSeconds,
} from '@/lib/tournament-engine'
import { triggerSmartHome } from '@/lib/smart-home'
import { createClient } from '@/lib/supabase/client'

interface TournamentStore {
  // State
  state: TournamentState | null
  template: Template | null
  rounds: TemplateRound[]
  tournamentId: string | null
  smartHomeConfig: SmartHomeConfig | null
  timerRunning: boolean
  pendingWinner: string | null

  // Actions
  initialize: (state: TournamentState, template: Template, rounds: TemplateRound[], tournamentId: string, smartHomeConfig: SmartHomeConfig | null) => void
  startTimer: () => void
  pauseTimer: () => void
  skipRound: () => void
  goToPrevRound: () => void
  eliminate: (playerName: string, killerName: string) => void
  rebuy: (playerName: string) => void
  // Internal helpers (typed to allow cross-action calls)
  _onRoundComplete: () => void
  _autoSave: () => void
  _saveToDb: () => void
  addon: (playerName: string) => void
  beginFireRounds: () => void
  completeFireRound: () => void
  confirmWinner: (winnerName: string) => void
  dismissWinner: () => void
  undo: () => void
  toggleGodMode: () => void
  godKillPlayer: (name: string) => void
  godRevivePlayer: (name: string) => void
  adjustPlayerStack: (name: string, delta: number) => void
  reset: () => void
}

let timerInterval: NodeJS.Timeout | null = null

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  state: null,
  template: null,
  rounds: [],
  tournamentId: null,
  smartHomeConfig: null,
  timerRunning: false,
  pendingWinner: null,

  initialize(state, template, rounds, tournamentId, smartHomeConfig) {
    clearTimer()
    set({ state, template, rounds, tournamentId, smartHomeConfig, timerRunning: false, pendingWinner: null })
    // Set initial timer duration
    if (rounds[state.currentRoundPosition]) {
      const round = rounds[state.currentRoundPosition]
      set(s => ({
        state: s.state ? { ...s.state, timeLeft: getRoundDurationSeconds(round) } : s.state
      }))
    }
  },

  startTimer() {
    const { state, rounds } = get()
    if (!state || get().timerRunning) return

    const round = rounds[state.currentRoundPosition]
    if (!round) return

    const endTime = Date.now() + state.timeLeft * 1000

    set(s => ({
      timerRunning: true,
      state: s.state ? { ...s.state, timerEndTime: endTime } : s.state,
    }))

    timerInterval = setInterval(() => {
      const { state: currentState, rounds: currentRounds } = get()
      if (!currentState) return

      const remaining = Math.round((endTime - Date.now()) / 1000)

      if (remaining > 0) {
        set(s => ({
          state: s.state ? { ...s.state, timeLeft: remaining } : s.state,
        }))
      } else {
        clearTimer()
        set({ timerRunning: false })
        get()._onRoundComplete()
      }
    }, 500)
  },

  pauseTimer() {
    clearTimer()
    set({ timerRunning: false })
  },

  skipRound() {
    const { state, rounds, template, smartHomeConfig } = get()
    if (!state || !template) return
    clearTimer()

    const currentRound = rounds[state.currentRoundPosition]
    const nextRound = rounds[state.currentRoundPosition + 1]
    if (!nextRound) return

    // Check if next round is a break — start fire rounds if configured
    if (nextRound.is_break && template.fire_rounds_count > 0 && template.fire_rounds_before_break && !state.inFireRounds) {
      const newState = startFireRounds(state)
      set({ state: newState, timerRunning: false })
      return
    }

    const newState = advanceRound(state, rounds)
    set({ state: newState, timerRunning: false })

    if (nextRound.is_break && smartHomeConfig) {
      triggerSmartHome('break', smartHomeConfig, {})
    } else if (smartHomeConfig) {
      triggerSmartHome('round_end', smartHomeConfig, {})
    }

    get()._autoSave()
  },

  goToPrevRound() {
    const { state, rounds } = get()
    if (!state) return
    clearTimer()
    const newState = prevRound(state, rounds)
    set({ state: newState, timerRunning: false })
  },

  eliminate(playerName, killerName) {
    const { state, template, smartHomeConfig } = get()
    if (!state || !template) return

    const newState = eliminatePlayer(state, playerName, killerName, template)
    set({ state: newState })

    if (smartHomeConfig) {
      triggerSmartHome('elimination', smartHomeConfig, { player: playerName, killer: killerName })
    }

    // Check for winner
    const winner = checkForWinner(newState)
    if (winner) {
      set({ pendingWinner: winner })
    }

    get()._autoSave()
  },

  rebuy(playerName) {
    const { state, template } = get()
    if (!state || !template) return
    const newState = rebuyPlayer(state, playerName, template)
    set({ state: newState })
    get()._autoSave()
  },

  addon(playerName) {
    const { state, template } = get()
    if (!state || !template) return
    const newState = addAddon(state, playerName, template)
    set({ state: newState })
    get()._autoSave()
  },

  beginFireRounds() {
    const { state } = get()
    if (!state) return
    const newState = startFireRounds(state)
    set({ state: newState })
  },

  completeFireRound() {
    const { state, template, rounds } = get()
    if (!state || !template) return
    const newState = completeFireRound(state)
    set({ state: newState })

    // If all fire rounds done, advance to break
    if (newState.fireRoundsDone >= template.fire_rounds_count) {
      const advanced = advanceRound(newState, rounds)
      set({ state: advanced })
    }
  },

  confirmWinner(winnerName) {
    const { state, template, smartHomeConfig } = get()
    if (!state || !template) return
    clearTimer()

    const newState = declareWinner(state, winnerName, template)
    set({ state: newState, timerRunning: false, pendingWinner: null })

    if (smartHomeConfig) {
      triggerSmartHome('winner', smartHomeConfig, { player: winnerName })
    }

    get()._saveToDb()
  },

  dismissWinner() {
    set({ pendingWinner: null })
  },

  undo() {
    const { state } = get()
    if (!state) return
    const newState = undoAction(state)
    set({ state: newState })
  },

  toggleGodMode() {
    const { state } = get()
    if (!state) return
    set({ state: toggleGodMode(state) })
  },

  godKillPlayer(name) {
    const { state, template } = get()
    if (!state || !template) return
    set({ state: godKill(state, name, template) })
  },

  godRevivePlayer(name) {
    const { state } = get()
    if (!state) return
    set({ state: godRevive(state, name) })
  },

  adjustPlayerStack(name, delta) {
    const { state } = get()
    if (!state) return
    set({ state: adjustStack(state, name, delta) })
  },

  reset() {
    clearTimer()
    set({ state: null, template: null, rounds: [], tournamentId: null, timerRunning: false, pendingWinner: null })
  },

  // Internal helpers
  _onRoundComplete() {
    const { state, rounds, template, smartHomeConfig } = get()
    if (!state || !template) return

    const currentRound = rounds[state.currentRoundPosition]
    const nextRound = rounds[state.currentRoundPosition + 1]

    if (!nextRound) return

    if (nextRound.is_break && template.fire_rounds_count > 0 && template.fire_rounds_before_break) {
      const newState = startFireRounds(state)
      set({ state: newState })
      return
    }

    const newState = advanceRound(state, rounds)
    set({ state: newState })

    if (nextRound.is_break && smartHomeConfig) {
      triggerSmartHome('break', smartHomeConfig, {})
    } else if (smartHomeConfig) {
      triggerSmartHome('round_end', smartHomeConfig, {})
    }

    // Auto-start timer for next round
    get().startTimer()
    get()._autoSave()
  },

  _autoSave() {
    const { state, tournamentId } = get()
    if (!state || !tournamentId) return

    const supabase = createClient()
    supabase
      .from('tournaments')
      .update({ game_state: state, current_round_position: state.currentRoundPosition, updated_at: new Date().toISOString() })
      .eq('id', tournamentId)
      .then(() => {})
  },

  _saveToDb() {
    const { state, tournamentId } = get()
    if (!state || !tournamentId) return

    const supabase = createClient()
    supabase
      .from('tournaments')
      .update({
        game_state: state,
        status: 'completed',
        ended_at: new Date().toISOString(),
        current_round_position: state.currentRoundPosition,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tournamentId)
      .then(() => {})
  },
} as TournamentStore))
