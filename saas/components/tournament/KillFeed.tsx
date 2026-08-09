'use client'

import { KillFeedEntry, EventType } from '@/types'

const EVENT_ICONS: Record<EventType, string> = {
  start: '🃏',
  elimination: '💀',
  rebuy: '🔥',
  addon: '➕',
  round: '▶',
  break: '☕',
  fire: '🔥',
  win: '🏆',
}

interface KillFeedProps {
  entries: KillFeedEntry[]
}

export function KillFeed({ entries }: KillFeedProps) {
  return (
    <div className="space-y-1 max-h-64 overflow-y-auto">
      {entries.length === 0 && (
        <p className="text-stone-500 text-xs text-center py-4">No events yet</p>
      )}
      {entries.map((entry, i) => (
        <div
          key={`${entry.iso}-${i}`}
          className={`flex items-start gap-2 text-xs rounded px-2 py-1 ${
            entry.type === 'elimination' ? 'bg-red-950/50 text-red-300' :
            entry.type === 'win'         ? 'bg-yellow-950/50 text-yellow-300' :
            entry.type === 'rebuy'       ? 'bg-orange-950/50 text-orange-300' :
            entry.type === 'break'       ? 'bg-blue-950/50 text-blue-300' :
            'bg-stone-800/50 text-stone-300'
          }`}
        >
          <span className="shrink-0">{EVENT_ICONS[entry.type] ?? '•'}</span>
          <span className="flex-1 leading-snug">{entry.text}</span>
          <span className="shrink-0 text-stone-500 font-mono">{entry.time}</span>
        </div>
      ))}
    </div>
  )
}
