/**
 * PHONE ATTENDANT — ROUTING ENGINE
 * ──────────────────────────────────
 * Cloudflare Worker that handles all VAPI tool calls.
 * The AI handles conversation only. This worker handles all logic.
 *
 * TOOLS HANDLED:
 *   check_business_hours       → is the business open right now?
 *   get_transfer_destination   → who should this call be transferred to?
 *   validate_topic             → is this question on-topic for this business?
 *   get_competitor_response    → return deflection text for a named competitor
 *   get_directions_response    → return guardrail redirect for directions requests
 *
 * KV NAMESPACE (required for round_robin routing):
 *   ATTENDANT_KV — stores per-client round robin state
 *
 * VAPI SETUP:
 *   Point your VAPI assistant's Server URL to this worker.
 *   Pass client_id as a parameter in every tool call.
 */

import { getConfig } from './configs/index.js'

const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

// ── Business Hours ────────────────────────────────────────────────────────────

function isBusinessOpen(config) {
  const now = new Date()

  // Get current time in the client's timezone
  const localStr = now.toLocaleString('en-US', { timeZone: config.timezone, hour12: false,
    weekday: 'long', hour: '2-digit', minute: '2-digit' })

  // Parse day and time from locale string (e.g. "Thursday, 14:30")
  const [weekdayPart, timePart] = localStr.split(', ')
  const dayName = weekdayPart.toLowerCase()
  const [hour, minute] = timePart.split(':').map(Number)
  const currentMinutes = hour * 60 + minute

  const hours = config.business_hours[dayName]
  if (!hours) return { open: false, day: weekdayPart, time: timePart }

  const [openH, openM]   = hours.open.split(':').map(Number)
  const [closeH, closeM] = hours.close.split(':').map(Number)
  const openMinutes  = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  return {
    open: currentMinutes >= openMinutes && currentMinutes < closeMinutes,
    day: weekdayPart,
    time: timePart,
    hoursToday: hours,
  }
}

function formatHours(hours) {
  if (!hours) return 'closed'
  const fmt = (t) => {
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2,'0')} ${ampm}`
  }
  return `${fmt(hours.open)} – ${fmt(hours.close)}`
}

// ── Transfer Routing ──────────────────────────────────────────────────────────

async function getNextTransferDestination(config, requestedName, env) {
  const destinations = config.transfer_destinations

  // Named transfer — caller asked for a specific person
  if (requestedName) {
    const target = destinations.find(d =>
      d.name.toLowerCase().includes(requestedName.toLowerCase()))
    if (target) {
      return { found: true, name: target.name, number: target.number, type: 'named' }
    }
    // Person not found — fall through to normal routing with a note
    return { found: false, fallback: true, message: `I don't have a direct line for ${requestedName}, but let me connect you with one of our team members who can help.` }
  }

  // Round robin — alternate per call using KV state
  if (config.routing_mode === 'round_robin') {
    const kvKey = `rr:${config.client_id}`
    let index = 0
    if (env?.ATTENDANT_KV) {
      const stored = await env.ATTENDANT_KV.get(kvKey)
      index = stored ? (parseInt(stored) + 1) % destinations.length : 0
      await env.ATTENDANT_KV.put(kvKey, String(index))
    }
    const dest = destinations[index]
    return { found: true, name: dest.name, number: dest.number, type: 'round_robin', index }
  }

  // Sequential — always try #1 first (VAPI handles fallback to #2 natively)
  const dest = destinations[0]
  return { found: true, name: dest.name, number: dest.number, type: 'sequential', all: destinations }
}

// ── Tool Handlers ─────────────────────────────────────────────────────────────

function handleCheckBusinessHours(config) {
  const status = isBusinessOpen(config)

  if (config.transfer_mode === 'always') {
    return `Transfers are available 24/7 for ${config.business_name}. Proceed with transfer attempt regardless of time.`
  }

  if (status.open) {
    return `${config.business_name} is currently OPEN (${status.day}, ${status.time}). Hours today: ${formatHours(status.hoursToday)}. Transfers are available — proceed with transfer attempt.`
  } else {
    const hours = status.hoursToday
    const todayHours = hours ? `Today's hours are ${formatHours(hours)}.` : `${config.business_name} is closed today.`
    return `${config.business_name} is currently CLOSED (${status.day}, ${status.time}). ${todayHours} Do NOT attempt a transfer. Tell the caller: "Our team is unavailable right now — let me take your information and have someone reach out ${config.callback_timeframe}." Then collect their contact info and proceed to Stage 5.`
  }
}

async function handleGetTransferDestination(config, args, env) {
  const requestedName = args.requested_name || null
  const dest = await getNextTransferDestination(config, requestedName, env)

  if (!dest.found) {
    return `${dest.message} Use normal sequential routing. Primary: ${config.transfer_destinations[0].name} at ${config.transfer_destinations[0].number}.`
  }

  if (dest.type === 'sequential') {
    const fallback = dest.all[1]
    let response = `Transfer to ${dest.name} at ${dest.number}.`
    if (fallback) {
      response += ` If no answer, immediately transfer to ${fallback.name} at ${fallback.number}.`
    }
    response += ` If neither answers, say: "I wasn't able to reach anyone on our team right now. Let me take your name and number and have someone call you back within ${config.callback_timeframe}." Then collect info and proceed to Stage 5.`
    return response
  }

  return `Transfer to ${dest.name} at ${dest.number}.`
}

function handleValidateTopic(config, args) {
  const topic = (args.topic || '').toLowerCase()
  const isOnTopic = config.services.some(s => topic.includes(s) || s.includes(topic))

  if (isOnTopic) {
    return 'ON_TOPIC: This is within the business scope. Proceed normally.'
  }

  return `OFF_TOPIC: This is outside the scope of ${config.business_name}. Respond with: "That's a little outside what I help with — is there anything about ${config.primary_service} I can assist you with today?" Do not engage further on the off-topic subject.`
}

function handleGetCompetitorResponse(config, args) {
  const mentioned = args.competitor_name || 'them'
  const isKnownCompetitor = config.competitors.some(c =>
    c.toLowerCase().includes(mentioned.toLowerCase()) || mentioned.toLowerCase().includes(c.toLowerCase()))

  if (!isKnownCompetitor && mentioned !== 'them') {
    return `Acknowledge you're familiar with ${mentioned} without positive or negative comment. Pivot: "What I can tell you is that ${config.business_name} brings ${config.key_differentiator}. Would you like to schedule a free consultation so we can show you what sets us apart?"`
  }

  return `COMPETITOR DEFLECTION: Never speak negatively about ${mentioned}. Say: "We're familiar with them — there are some good options in the area. What I can tell you is that ${config.business_name} brings ${config.key_differentiator}. A lot of our customers come to us after getting quotes elsewhere because of ${config.differentiator_reason}. Would you like to schedule a free consultation so we can show you what sets us apart?"`
}

function handleGetDirectionsResponse(config) {
  return `DIRECTIONS GUARDRAIL: Do NOT give directions, landmarks, or cross streets. Only share the exact address. Say: "Our address is ${config.business_address}. The easiest way to get here is to plug that into Google Maps — it'll give you turn-by-turn from wherever you are." Do not add anything else about the route.`
}

// ── Main Handler ──────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    const message = body?.message
    if (message?.type !== 'tool-calls') {
      return new Response(JSON.stringify({ error: 'Expected tool-calls message type' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    const results = []

    for (const toolCall of message.toolCallList || []) {
      const { id, function: fn } = toolCall
      let args = {}
      try { args = JSON.parse(fn.arguments || '{}') } catch { /* ignore */ }

      let result

      try {
        // Every tool call must include client_id
        const clientId = args.client_id
        if (!clientId) throw new Error('Missing client_id in tool arguments')
        const config = getConfig(clientId)

        switch (fn.name) {
          case 'check_business_hours':
            result = handleCheckBusinessHours(config)
            break

          case 'get_transfer_destination':
            result = await handleGetTransferDestination(config, args, env)
            break

          case 'validate_topic':
            result = handleValidateTopic(config, args)
            break

          case 'get_competitor_response':
            result = handleGetCompetitorResponse(config, args)
            break

          case 'get_directions_response':
            result = handleGetDirectionsResponse(config)
            break

          default:
            result = `Unknown tool "${fn.name}". No action taken.`
        }
      } catch (err) {
        result = `Engine error: ${err.message}`
      }

      results.push({ toolCallId: id, result })
    }

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
