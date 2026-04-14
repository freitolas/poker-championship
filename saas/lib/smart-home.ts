import {
  SmartHomeConfig,
  SmartHomeEvent,
  SmartHomeProvider,
  WebhookConfig,
  HueConfig,
  HomeAssistantConfig,
} from '@/types'

interface TriggerPayload {
  player?: string
  killer?: string
}

export async function triggerSmartHome(
  event: SmartHomeEvent,
  config: SmartHomeConfig,
  payload: TriggerPayload = {}
): Promise<void> {
  try {
    switch (config.provider) {
      case 'webhook':
      case 'ifttt':
        await triggerWebhook(event, config.config as WebhookConfig, payload)
        break
      case 'hue':
        await triggerHue(event, config.config as HueConfig)
        break
      case 'home_assistant':
        await triggerHomeAssistant(event, config.config as HomeAssistantConfig, payload)
        break
    }
  } catch (err) {
    console.error(`Smart home trigger failed (${config.provider}/${event}):`, err)
  }
}

async function triggerWebhook(
  event: SmartHomeEvent,
  config: WebhookConfig,
  payload: TriggerPayload
) {
  const urlMap: Record<SmartHomeEvent, string | undefined> = {
    elimination: config.elimination_url,
    round_end: config.round_end_url,
    break: config.break_url,
    winner: config.winner_url,
  }

  const url = urlMap[event]
  if (!url) return

  const sep = url.includes('?') ? '&' : '?'
  const qs = new URLSearchParams()
  if (payload.player) qs.set('value1', payload.player)
  if (payload.killer) qs.set('value2', payload.killer)

  await fetch(`${url}${sep}${qs.toString()}`, { mode: 'no-cors' })
}

async function triggerHue(event: SmartHomeEvent, config: HueConfig) {
  if (!config.bridge_ip || !config.username) return

  const groupId = config.group_id || '0'
  const baseUrl = `http://${config.bridge_ip}/api/${config.username}/groups/${groupId}/action`

  const sceneMap: Record<SmartHomeEvent, string | undefined> = {
    elimination: config.elimination_scene,
    round_end: config.round_end_scene,
    break: config.break_scene,
    winner: config.winner_scene,
  }

  // Color effects per event when no scene configured
  const effectMap: Record<SmartHomeEvent, object> = {
    elimination: { on: true, hue: 0, sat: 254, bri: 254, alert: 'lselect' },     // Red flash
    round_end:   { on: true, hue: 6000, sat: 254, bri: 200, alert: 'select' },    // Orange
    break:       { on: true, hue: 8000, sat: 150, bri: 150, alert: 'none' },      // Warm white
    winner:      { on: true, hue: 46920, sat: 254, bri: 254, effect: 'colorloop' }, // Rainbow
  }

  const scene = sceneMap[event]
  const body = scene
    ? JSON.stringify({ scene })
    : JSON.stringify(effectMap[event])

  await fetch(baseUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
}

async function triggerHomeAssistant(
  event: SmartHomeEvent,
  config: HomeAssistantConfig,
  payload: TriggerPayload
) {
  if (!config.ha_url || !config.access_token) return

  const webhookMap: Record<SmartHomeEvent, string | undefined> = {
    elimination: config.elimination_webhook_id,
    round_end: config.round_end_webhook_id,
    break: config.break_webhook_id,
    winner: config.winner_webhook_id,
  }

  const webhookId = webhookMap[event]
  if (!webhookId) return

  const url = `${config.ha_url.replace(/\/$/, '')}/api/webhook/${webhookId}`

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event, ...payload }),
  })
}
