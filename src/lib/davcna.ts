// Davčna številka check (AGENTS.md §6): 8 digits, the last is a check digit.
// Weights 8..2 on the first 7 digits; 11 − (sum mod 11); 10 → 0, 11 → invalid.

export function davcnaCheckDigit(first7: string): number | null {
  if (!/^[0-9]{7}$/.test(first7)) return null;
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += Number(first7[i]) * (8 - i);
  const r = 11 - (sum % 11);
  if (r === 11) return null;
  return r === 10 ? 0 : r;
}

/** Removes spaces people type in, e.g. "1234 5678" → "12345678". */
export function normalizeDavcna(input: string): string {
  return input.replace(/\s+/g, "");
}

export function isValidDavcna(input: string): boolean {
  const d = normalizeDavcna(input);
  if (!/^[0-9]{8}$/.test(d)) return false;
  return davcnaCheckDigit(d.slice(0, 7)) === Number(d[7]);
}

/** What a davčna input keeps while typing or pasting: digits only, at most 8. */
export function cleanDavcnaInput(input: string): string {
  return input.replace(/\D/g, "").slice(0, 8);
}

/**
 * Slovenian error that tells the user what to do, or undefined when valid.
 * Used both in the browser (before submit) and in server actions.
 */
export function davcnaError(input: string): string | undefined {
  const d = normalizeDavcna(input);
  if (d === "") return "Vpišite davčno številko. Ima 8 števk.";
  if (!/^[0-9]+$/.test(d)) return "Davčna številka ima samo števke. Preverite jo in vpišite znova.";
  if (d.length !== 8) {
    return `Davčna številka ima 8 števk, vpisanih je ${d.length}. Preverite jo in vpišite znova.`;
  }
  if (!isValidDavcna(d)) return "Ta davčna številka ne obstaja. Ena od števk je napačna – preverite jo in vpišite znova.";
  return undefined;
}
