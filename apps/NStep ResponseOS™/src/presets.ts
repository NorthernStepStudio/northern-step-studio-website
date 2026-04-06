export type ClientPreset = {
  id: string;
  label: string;
  description: string;
  tenantId: string;
  services: string[];
  bookingHint: string;
  alertHint: string;
};

export const CLIENT_PRESETS: ClientPreset[] = [
  {
    id: 'hvac',
    label: 'HVAC Service',
    description: 'Fast-response heating and cooling teams with emergency no-heat/no-cool demand.',
    tenantId: 'hvac-service',
    services: ['no heat repair', 'no cooling repair', 'maintenance plan', 'system replacement'],
    bookingHint: 'Use a dispatch or estimate booking link.',
    alertHint: 'Owner alerts should usually go to the dispatcher line.',
  },
  {
    id: 'plumbing',
    label: 'Plumbing',
    description: 'Leak, drain, sewer, and water-heater workflows with after-hours urgency.',
    tenantId: 'plumbing-service',
    services: ['leak repair', 'drain cleaning', 'water heater service', 'sewer inspection'],
    bookingHint: 'Use a service request or estimate booking link.',
    alertHint: 'Hot leads should alert the on-call plumber or owner.',
  },
  {
    id: 'electrical',
    label: 'Electrical',
    description: 'Panel, outlet, lighting, and rewiring jobs with safety-driven triage.',
    tenantId: 'electrical-service',
    services: ['panel upgrade', 'outlet repair', 'lighting install', 'rewiring'],
    bookingHint: 'Use a quote or service-call booking link.',
    alertHint: 'Owner alerts should go to the licensed electrician or manager.',
  },
  {
    id: 'roofing',
    label: 'Roofing',
    description: 'Storm, leak, inspection, and replacement jobs with image-heavy intake.',
    tenantId: 'roofing-service',
    services: ['roof leak repair', 'storm damage inspection', 'roof replacement', 'gutter work'],
    bookingHint: 'Use an inspection booking link if available.',
    alertHint: 'Route alerts to the estimator or owner.',
  },
];
