import { AppLanguage, getCurrentLanguage } from "../i18n";

type CopyDictionary = {
  STAY_CONSISTENT: string;
  STAY_HONEST: string;
  DASHBOARD_STABILITY: string;
  DASHBOARD_LEARN: string;
  DASHBOARD_PAPER: string;
  DASHBOARD_REAL: string;
  ONBOARDING_INTRO: string;
  ONBOARDING_STORAGE: string;
  PORTFOLIO_PAPER_DESC: string;
  PORTFOLIO_REAL_DESC: string;
  PORTFOLIO_REBALANCE_TIP: string;
  CHECKIN_FAIL: string;
  CHECKIN_SUCCESS: string;
  GUARDRAIL_FOMO: string;
  GUARDRAIL_EMERGENCY: string;
  GUARDRAIL_DIVERSIFICATION: string;
};

const COPY_BY_LANGUAGE: Record<AppLanguage, CopyDictionary> = {
  en: {
    STAY_CONSISTENT:
      "Boring wealth is the only kind that lasts. Stop trying to 'get cute' with your money.",
    STAY_HONEST: "Good. Denial is expensive. Now let's fix the mess.",
    DASHBOARD_STABILITY:
      "Stability first. You're building a foundation, not a casino. It's boring, but brave.",
    DASHBOARD_LEARN:
      "Yeah, you actually have to read. If you ignore this, don't cry when the market schools you.",
    DASHBOARD_PAPER:
      "Training wheels. Use this to practice not panicking. It's harder than it looks.",
    DASHBOARD_REAL:
      "Real money handles differently. Breathe. Don't do anything you'll regret at 3 AM.",
    ONBOARDING_INTRO:
      "Welcome to NooBS (noob + no bullshit). We're here to save you from your own worst instincts. It won't always be pretty, but it will be true.",
    ONBOARDING_STORAGE:
      "Stored locally. No accounts, no data-mining, no BS. Just you and the truth.",
    PORTFOLIO_PAPER_DESC:
      "Training wheels. Use this to build discipline, not a fake ego. Paper gains don't buy groceries.",
    PORTFOLIO_REAL_DESC:
      "Real money actually hurts. If you're guessing, you're just a gambler with a phone.",
    PORTFOLIO_REBALANCE_TIP:
      "Don't chase 'winners'. Chase your plan. If your portfolio is exciting, you're doing it wrong.",
    CHECKIN_FAIL:
      "At least you're honest about failing. Now stop talking and go fix it.",
    CHECKIN_SUCCESS:
      "You managed to not blow up your life this week. Nice. Now do it again 2,000 more times.",
    GUARDRAIL_FOMO:
      "Pulse racing? That's FOMO, not a strategy. Sit on your hands until you've calmed down.",
    GUARDRAIL_EMERGENCY:
      "No emergency fund? Then this isn't an investment-it's a prayer. Put the money in the bank.",
    GUARDRAIL_DIVERSIFICATION:
      "Whoa. That's a lot of one thing. Diversification is insurance. This is just asking for a bad headline to ruin you."
  },
  es: {
    STAY_CONSISTENT:
      "La riqueza aburrida es la unica que dura. Deja de intentar ser 'creativo' con tu dinero.",
    STAY_HONEST: "Bien. Negar la realidad sale caro. Ahora arreglemos este desastre.",
    DASHBOARD_STABILITY:
      "Primero estabilidad. Estas construyendo una base, no un casino. Es aburrido, pero valiente.",
    DASHBOARD_LEARN:
      "Si, toca estudiar. Si lo ignoras, luego no llores cuando el mercado te de una leccion.",
    DASHBOARD_PAPER:
      "Ruedas de entrenamiento. Practica no entrar en panico. Es mas dificil de lo que parece.",
    DASHBOARD_REAL:
      "El dinero real se siente distinto. Respira. No hagas nada que lamentes a las 3 AM.",
    ONBOARDING_INTRO:
      "Bienvenido a NooBS (noob + no bullshit). Estamos aqui para salvarte de tus peores impulsos. No siempre sera bonito, pero sera real.",
    ONBOARDING_STORAGE:
      "Guardado localmente. Sin cuentas, sin mineria de datos, sin humo. Solo tu y la verdad.",
    PORTFOLIO_PAPER_DESC:
      "Ruedas de entrenamiento. Esto es para disciplina, no para inflar tu ego. Las ganancias en papel no pagan comida.",
    PORTFOLIO_REAL_DESC:
      "El dinero real duele. Si estas adivinando, solo eres un apostador con telefono.",
    PORTFOLIO_REBALANCE_TIP:
      "No persigas ganadores. Persigue tu plan. Si tu portafolio emociona demasiado, algo va mal.",
    CHECKIN_FAIL:
      "Al menos fuiste honesto al fallar. Ahora deja de hablar y corrigelo.",
    CHECKIN_SUCCESS:
      "Lograste no destruir tu vida financiera esta semana. Bien. Repite lo mismo 2,000 veces mas.",
    GUARDRAIL_FOMO:
      "Pulso acelerado? Eso es FOMO, no estrategia. Calmate antes de tocar nada.",
    GUARDRAIL_EMERGENCY:
      "Sin fondo de emergencia? Entonces esto no es inversion, es una plegaria. Guarda ese dinero en el banco.",
    GUARDRAIL_DIVERSIFICATION:
      "Demasiado de una sola cosa. Diversificar es seguro. Asi solo esperas que una mala noticia te hunda."
  }
};

export const getCopy = (
  language: AppLanguage = getCurrentLanguage()
): CopyDictionary => COPY_BY_LANGUAGE[language] ?? COPY_BY_LANGUAGE.en;

export const COPY: CopyDictionary = new Proxy({} as CopyDictionary, {
  get(_target, property: string): string {
    const lang = getCurrentLanguage();
    const key = property as keyof CopyDictionary;
    return COPY_BY_LANGUAGE[lang]?.[key] ?? COPY_BY_LANGUAGE.en[key] ?? "";
  }
});