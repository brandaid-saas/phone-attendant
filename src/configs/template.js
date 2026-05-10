/**
 * PHONE ATTENDANT — CLIENT CONFIG TEMPLATE
 * ─────────────────────────────────────────
 * Copy this file, rename it to your client's slug (e.g. acme-plumbing.js),
 * fill in every field, then add the export to src/configs/index.js.
 *
 * The engine in worker.js reads this config — never touches prompts.
 * All routing, hours, and SMS logic is 100% deterministic from this file.
 */

export const TEMPLATE_CONFIG = {

  // ── Identity ──────────────────────────────────────────────────────────────
  client_id:        'client_slug',          // unique, lowercase, hyphens only
  business_name:    'Business Name',
  attendant_name:   'Ava',                  // the AI's name on this account
  business_phone:   '(555) 000-0000',
  business_address: '123 Main St, City, State ZIP',
  primary_service:  'your primary service', // used in spam gate greeting

  // ── Business Hours ────────────────────────────────────────────────────────
  // Set to null for closed days. Times are 24h format in the local timezone.
  timezone: 'America/Chicago',
  business_hours: {
    monday:    { open: '08:00', close: '17:00' },
    tuesday:   { open: '08:00', close: '17:00' },
    wednesday: { open: '08:00', close: '17:00' },
    thursday:  { open: '08:00', close: '17:00' },
    friday:    { open: '08:00', close: '17:00' },
    saturday:  null,
    sunday:    null,
  },

  // ── Transfer Settings ─────────────────────────────────────────────────────
  // transfer_mode: 'business_hours' = transfers only during open hours
  //                'always'         = transfers 24/7
  transfer_mode: 'business_hours',

  // routing_mode: 'sequential'  = always try #1 first, then #2
  //               'round_robin' = alternate between team members per call
  routing_mode: 'sequential',

  // List in priority order. Named transfer requests match on 'name'.
  transfer_destinations: [
    { name: 'Salesperson One', number: '+15550000001' },
    { name: 'Salesperson Two', number: '+15550000002' },
  ],

  // Shown to caller when team is unavailable
  callback_timeframe: 'first thing tomorrow morning',

  // ── SMS Notifications ─────────────────────────────────────────────────────
  sms_enabled: true,
  sms_notification_number: '+15550000001', // primary recipient for lead alerts
  sms_callback_timeframe:  '24 hours',     // shown in caller confirmation SMS

  // ── Competitor Deflection ─────────────────────────────────────────────────
  // Names only — never speak negatively. Engine returns a pivot response.
  competitors: [
    'Competitor A',
    'Competitor B',
  ],
  key_differentiator:   'our [unique strength]',
  differentiator_reason: '[why customers choose you over them]',

  // ── Services ──────────────────────────────────────────────────────────────
  // Used by the guardrail engine to validate on-topic responses.
  services: [
    'service one',
    'service two',
    'service three',
  ],

}
