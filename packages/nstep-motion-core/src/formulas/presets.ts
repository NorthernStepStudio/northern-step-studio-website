import { FormulaPreset } from './formulaTypes';

export const FORMULA_PRESETS: FormulaPreset[] = [
  { id: 'breathingY', name: 'Breathing', description: 'Soft vertical idle motion' },
  { id: 'swayRotation', name: 'Sway Rotation', description: 'Smooth sine wave offset on rotation' },
  { id: 'bobPosition', name: 'Bob Position', description: 'General sine wave on position' },
  { id: 'squashStretch', name: 'Squash & Stretch', description: 'Scale oscillating from base' },
  { id: 'walkCycle', name: 'Walk Cycle', description: 'Normalized repeating walk motion' },
  { id: 'runCycle', name: 'Run Cycle', description: 'Fast aggressive repeating motion' },
  { id: 'weaponSwing', name: 'Weapon Swing', description: 'Anticipation -> Strike -> Recovery' },
  { id: 'recoil', name: 'Recoil', description: 'Short pushback after attack' },
  { id: 'impactShake', name: 'Impact Shake', description: 'Decaying shake for hurt state' },
  { id: 'capeLag', name: 'Cape/Cloak Lag', description: 'Delayed sway for trailing parts' },
  { id: 'staffSway', name: 'Staff Sway', description: 'Delayed staff arc' },
  { id: 'shieldBrace', name: 'Shield Brace', description: 'Defensive forward push' },
  { id: 'deathFall', name: 'Death Fall', description: 'Collapse with rotation' },
  { id: 'blinkScale', name: 'Blink Scale', description: 'Quick clamp scale for blinking' },
  { id: 'hoverFloat', name: 'Hover Float', description: 'Slow, large amplitude Y sine' },
  { id: 'runLean', name: 'Run Lean', description: 'Forward lean based on speed' },
  { id: 'legCycle', name: 'Leg Cycle', description: 'Legacy walking logic' },
];
