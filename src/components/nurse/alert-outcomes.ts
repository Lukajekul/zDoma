export const alertOutcomes = {
  contacted_all_ok: "Poklicano – vse v redu",
  visit_booked: "Naročen pregled",
  gp_notified: "Obveščen osebni zdravnik",
  plan_adjusted: "Načrt prilagojen",
} as const;

export type AlertOutcome = keyof typeof alertOutcomes;

export function isAlertOutcome(value: unknown): value is AlertOutcome {
  return typeof value === "string" && Object.hasOwn(alertOutcomes, value);
}
