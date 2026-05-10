export const UNITED_STONE_CONFIG = {

  client_id:        'united_stone',
  business_name:    'United Stone Countertops',
  attendant_name:   'Ava',
  business_phone:   '(INSERT PHONE)',
  business_address: 'INSERT FULL ADDRESS',
  primary_service:  'countertop fabrication and installation',

  timezone: 'America/Chicago',
  business_hours: {
    monday:    { open: '08:00', close: '17:00' },
    tuesday:   { open: '08:00', close: '17:00' },
    wednesday: { open: '08:00', close: '17:00' },
    thursday:  { open: '08:00', close: '17:00' },
    friday:    { open: '08:00', close: '17:00' },
    saturday:  { open: '09:00', close: '13:00' },
    sunday:    null,
  },

  transfer_mode:  'business_hours',
  routing_mode:   'sequential',
  transfer_destinations: [
    { name: 'INSERT NAME', number: '+1INSERT NUMBER' },
    { name: 'INSERT NAME', number: '+1INSERT NUMBER' },
  ],

  callback_timeframe:      'first thing tomorrow morning',
  sms_enabled:             true,
  sms_notification_number: '+1INSERT NUMBER',
  sms_callback_timeframe:  '24 hours',

  competitors: ['INSERT COMPETITOR 1', 'INSERT COMPETITOR 2'],
  key_differentiator:    'our in-house fabrication shop and same-week installation',
  differentiator_reason: 'faster turnaround and direct pricing with no middleman',

  services: [
    'granite countertops',
    'quartz countertops',
    'marble countertops',
    'countertop fabrication',
    'countertop installation',
    'kitchen countertops',
    'bathroom countertops',
  ],
}
