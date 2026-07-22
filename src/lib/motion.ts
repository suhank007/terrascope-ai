/**
 * Shared motion vocabulary. Every animated component in the HUD should pull
 * from here rather than inlining its own easing/duration/spring values —
 * that's what keeps sixty different transitions feeling like one product.
 */

/** Signature "ease out expo" curve — decisive start, soft landing. Never bounces. */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const DURATION = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
} as const;

/** Critically-damped-or-above spring — reaches its target with zero overshoot. */
export const SPRING_PANEL = {
  type: "spring",
  stiffness: 320,
  damping: 38,
  mass: 0.9,
} as const;

/**
 * Stagger helper for short lists that reveal item-by-item (search results,
 * copilot suggestions). Reserved for lists capped around 3-6 items — on
 * anything longer the reveal starts reading as slow rather than premium.
 */
export const STAGGER_LIST = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.035, delayChildren: 0.03 } },
  },
  item: {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT_EXPO } },
  },
} as const;
