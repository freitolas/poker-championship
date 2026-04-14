// ============================================================
// Core domain types
// ============================================================

export type SubscriptionTier = 'free' | 'pro'
export type TournamentStatus = 'pending' | 'active' | 'completed'
export type SmartHomeProvider = 'webhook' | 'ifttt' | 'hue' | 'home_assistant'
export type SmartHomeEvent = 'elimination' | 'round_end' | 'break' | 'winner'
export type EventType = 'start' | 'elimination' | 'rebuy' | 'addon' | 'round' | 'break' | 'win' | 'fire'

// ============================================================
// Database row types
// ============================================================

export interface Profile {
  id: string
  display_name: string | null
  subscription_tier: SubscriptionTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  narration_used_free: boolean
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface Template {
  id: string
  user_id: string | null
  name: string
  description: string | null
  is_system: boolean
  buy_in_amount: number
  rebuy_amount: number
  addon_amount: number
  prize_first_pct: number
  prize_second_pct: number
  house_fee_pct: number
  starting_chips: number
  allow_rebuys: boolean
  allow_addons: boolean
  fire_rounds_count: number
  fire_rounds_before_break: boolean
  created_at: string
  updated_at: string
  template_rounds?: TemplateRound[]
}

export interface TemplateRound {
  id: string
  template_id: string
  position: number
  name: string
  small_blind: number
  big_blind: number
  duration_minutes: number
  is_break: boolean
  is_test: boolean
}

export interface Tournament {
  id: string
  user_id: string
  template_id: string | null
  name: string
  is_major: boolean
  status: TournamentStatus
  current_round_position: number
  started_at: string | null
  ended_at: string | null
  game_state: TournamentState | null
  created_at: string
  updated_at: string
}

export interface TournamentPlayer {
  id: string
  tournament_id: string
  player_pool_id: string | null
  name: string
  stacks: number
  total_paid: number
  has_addon: boolean
  is_eliminated: boolean
  eliminated_at: string | null
  eliminated_by: string | null
  final_rank: number | null
  prize_won: number
  rebuy_count: number
}

export interface TournamentEvent {
  id: string
  tournament_id: string
  event_type: EventType
  player_name: string | null
  actor_name: string | null
  round_position: number | null
  elapsed_minutes: number | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface SmartHomeConfig {
  id: string
  user_id: string
  provider: SmartHomeProvider
  config: WebhookConfig | IFTTTConfig | HueConfig | HomeAssistantConfig
  updated_at: string
}

// ============================================================
// Smart home provider configs
// ============================================================

export interface WebhookConfig {
  elimination_url?: string
  round_end_url?: string
  break_url?: string
  winner_url?: string
}

export type IFTTTConfig = WebhookConfig // same shape

export interface HueConfig {
  bridge_ip: string
  username: string
  elimination_scene?: string
  round_end_scene?: string
  break_scene?: string
  winner_scene?: string
  group_id?: string
}

export interface HomeAssistantConfig {
  ha_url: string
  access_token: string
  elimination_webhook_id?: string
  round_end_webhook_id?: string
  break_webhook_id?: string
  winner_webhook_id?: string
}

// ============================================================
// Tournament engine state (Zustand / game logic)
// ============================================================

export interface GamePlayer {
  name: string
  stacks: number
  totalPaid: number
  isEliminated: boolean
  hasAddon: boolean
  eliminatedBy: string | null
  eliminatedAt: number | null
  rebuyCount: number
  rebuyEliminations: Array<{ eliminatedBy: string; timestamp: number }>
}

export interface KillFeedEntry {
  type: EventType
  text: string
  time: string
  elapsed: number
  iso: string
}

export interface TournamentState {
  players: GamePlayer[]
  currentRoundPosition: number
  timeLeft: number
  timerEndTime: number | null
  tournamentStarted: boolean
  tournamentEnded: boolean
  tournamentName: string
  isMajor: boolean
  killFeed: KillFeedEntry[]
  tournamentStartTime: number | null
  inFireRounds: boolean
  fireRoundsDone: number
  breakStartTime: number | null
  godMode: boolean
  undoStack: TournamentState[]
  savedAt?: number
}

export interface PrizeBreakdown {
  grossPot: number
  houseFee: number
  netPot: number
  firstPrize: number
  secondPrize: number
  killerBonus: number
  killerName: string | null
}

export interface LeaderboardEntry {
  name: string
  points: number
  wins: number
  secondPlaces: number
  thirdPlaces: number
  kills: number
  gamesPlayed: number
  titles: string[]
}
