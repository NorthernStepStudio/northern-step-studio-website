import { MotionController } from '../schema/types';

/**
 * Evaluates a motion controller formula and returns the offset value.
 */
export function evaluateController(c: MotionController, time: number, animDuration: number): number {
  const p = c.params;
  const t = time * p.speed * Math.PI * 2 + p.phase;
  let val = 0;

  switch (c.formulaPreset) {
    case 'breathingY':
    case 'walkCycle':
    case 'legCycle':
      val = Math.sin(t) * p.amplitude + p.offset;
      break;
    case 'runCycle':
      val = (Math.sin(t) + Math.sin(t * 2.0) * 0.5) * p.amplitude + p.offset;
      break;
    case 'weaponSwing': {
      const progress = (time % animDuration) / animDuration;
      let swing = 0;
      if (progress < 0.2) {
        swing = -Math.sin(progress * Math.PI * 2.5) * 0.3;
      } else if (progress < 0.5) {
        swing = Math.sin((progress - 0.2) * Math.PI * 3.33);
      } else {
        swing = Math.cos((progress - 0.5) * Math.PI);
      }
      val = swing * p.amplitude + p.offset;
      break;
    }
    case 'recoil':
      val = Math.sin(time * 20.0) * Math.exp(-time * 10.0) * p.amplitude + p.offset;
      break;
    case 'impactShake':
      val = (Math.random() * 2.0 - 1.0) * Math.exp(-time * 8.0) * p.amplitude + p.offset;
      break;
    case 'capeLag':
      val = Math.sin(t - 0.5) * p.amplitude + p.offset;
      break;
    case 'staffSway':
      val = Math.sin(t - 0.3) * p.amplitude + p.offset;
      break;
    case 'shieldBrace': {
      const brace = time < 0.3 ? (time / 0.3) : 1.0;
      val = brace * p.amplitude + p.offset;
      break;
    }
    case 'deathFall':
      val = Math.min(1.0, time / animDuration) * p.amplitude + p.offset;
      break;
    case 'blinkScale':
      val = (Math.sin(t) < -0.8 ? -p.amplitude : 0) + p.offset;
      break;
    case 'hoverFloat':
      val = Math.sin(t * 0.5) * p.amplitude + p.offset;
      break;
    case 'runLean':
      val = p.offset;
      break;
    case 'attackStrike':
      val = Math.sin(t) * Math.exp(-time * 2.0) * p.amplitude + p.offset;
      break;
    case 'hurtShake':
      val = Math.sin(time * 30.0) * Math.exp(-time * 5.0) * p.amplitude + p.offset;
      break;
    case 'deathCollapse':
      val = (time / animDuration) * p.amplitude + p.offset;
      break;
    default:
      val = Math.sin(t) * p.amplitude + p.offset;
      break;
  }

  return val;
}
