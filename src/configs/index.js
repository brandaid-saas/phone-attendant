/**
 * CLIENT CONFIG REGISTRY
 * ──────────────────────
 * Import and register every active client here.
 * The worker looks up configs by client_id at runtime.
 *
 * To add a new client:
 *   1. Copy template.js → src/configs/your-client.js
 *   2. Fill in all fields
 *   3. Import and add to CLIENT_CONFIGS below
 */

import { UNITED_STONE_CONFIG } from './united-stone.js'

// Registry — all active client configs indexed by client_id
export const CLIENT_CONFIGS = {
  [UNITED_STONE_CONFIG.client_id]: UNITED_STONE_CONFIG,
}

export function getConfig(clientId) {
  const config = CLIENT_CONFIGS[clientId]
  if (!config) throw new Error(`No config found for client_id: "${clientId}"`)
  return config
}
