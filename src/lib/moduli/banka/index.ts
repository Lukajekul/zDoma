import type { Banka } from "../types";
import { moduli } from "./moduli";
import { postavke } from "./postavke";

/** The approved item bank. Content changes never alter an approved plan: plans keep a snapshot. */
export const banka: Banka = { postavke, moduli };
