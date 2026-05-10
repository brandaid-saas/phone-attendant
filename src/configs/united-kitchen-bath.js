export const UNITED_KITCHEN_BATH_CONFIG = {

  client_id:        'united_kitchen_bath',
  business_name:    'United Kitchen & Bath',
  attendant_name:   'Ava',
  business_phone:   '(INSERT PHONE)',
  business_address: 'INSERT FULL ADDRESS',
  primary_service:  'kitchen and bath remodeling',

  timezone: 'America/Chicago',
  business_hours: {
    monday:    { open: '08:00', close: '17:00' },
    tuesday:   { open: '08:00', close: '17:00' },
    wednesday: { open: '08:00', close: '17:00' },
    thursday:  { open: '08:00', close: '17:00' },
    friday:    { open: '08:00', close: '17:00' },
    saturday:  { open: '09:00', close: '14:00' },
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
  key_differentiator:    'our in-house design team and lifetime installation warranty',
  differentiator_reason: 'the quality of our materials and how fast we complete projects',

  services: [
    'kitchen remodeling',
    'bathroom renovation',
    'countertop installation',
    'cabinet installation',
    'tile work',
  ],
}
