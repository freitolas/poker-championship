import { SubscriptionTier } from '@/types'

export const TIER_LIMITS = {
  free: {
    maxActiveTournaments: 1,
    maxPlayers: 10,
    canCreateCustomTemplates: false,
    canUseSmartHome: false,
    narrationLimit: 1,  // one-time free use
    fullStats: false,
  },
  pro: {
    maxActiveTournaments: Infinity,
    maxPlayers: Infinity,
    canCreateCustomTemplates: true,
    canUseSmartHome: true,
    narrationLimit: Infinity,
    fullStats: true,
  },
} as const

export function canUseFeature(tier: SubscriptionTier, feature: keyof typeof TIER_LIMITS.free): boolean {
  const limits = TIER_LIMITS[tier]
  const value = limits[feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  return false
}

export function canUseNarration(tier: SubscriptionTier, narrationUsedFree: boolean): boolean {
  if (tier === 'pro') return true
  return !narrationUsedFree
}
