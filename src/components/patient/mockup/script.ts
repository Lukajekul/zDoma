// Static demo script for the phone/SMS check-in mock-up (T-14).
// Mock only: real check-ins read the patient's template (src/lib/templates/).
// Questions follow docs/checkin-questions.md, srčno popuščanje, for the demo
// patient Janez (dry weight 72 kg, target blood pressure 130/80).
// Messages leave the app, so no diagnosis or medicine names (AGENTS.md §6).

export type MockOption = {
  /** Digit the patient sends or presses. */
  key: string;
  label: string;
  /** A nurse should look at this answer. */
  flag?: boolean;
  /** Emergency: "Pokličite 112" before anything is saved. */
  emergency?: boolean;
};

export type MockQuestion = { id: string; text: string; options: MockOption[] };

export const PATIENT_NAME = "Janez";

export const GREETING = `Dobro jutro, ${PATIENT_NAME}. Čas je za današnji pregled. Traja 30 sekund.`;

/** Always asked, also on an "Enako kot včeraj" day. */
export const ALWAYS_ASKED: MockQuestion[] = [
  {
    id: "teza",
    text: "Stopite na tehtnico. Koliko tehtate danes?",
    options: [
      { key: "1", label: "Manj kot 73 kg" },
      { key: "2", label: "Od 73 do 74 kg" },
      { key: "3", label: "Več kot 74 kg", flag: true },
    ],
  },
  {
    id: "prsi",
    text: "Ali imate bolečino v prsih ali ste omedleli?",
    options: [
      { key: "1", label: "Ne" },
      { key: "2", label: "Da", emergency: true },
    ],
  },
];

/** Offered when yesterday was green: one answer covers the rest. */
export const SAME_AS_YESTERDAY: MockQuestion = {
  id: "enako",
  text: "Je vse ostalo enako kot včeraj?",
  options: [
    { key: "1", label: "Da, enako kot včeraj" },
    { key: "2", label: "Ne, vprašajte me" },
  ],
};

export const DETAIL_QUESTIONS: MockQuestion[] = [
  {
    id: "dusenje",
    text: "Ali vas danes bolj duši kot običajno?",
    options: [
      { key: "1", label: "Ne" },
      { key: "2", label: "Pri hoji bolj" },
      { key: "3", label: "Tudi ko ležim ali ponoči", flag: true },
    ],
  },
  {
    id: "otekline",
    text: "Ali so vam gležnji ali noge danes bolj otekli?",
    options: [
      { key: "1", label: "Ne" },
      { key: "2", label: "Da", flag: true },
    ],
  },
  {
    id: "tablete",
    text: "Ste včeraj vzeli vse tablete?",
    options: [
      { key: "1", label: "Da" },
      { key: "2", label: "Ne", flag: true },
    ],
  },
  {
    id: "tlak",
    text: "Izmerite krvni tlak. Kakšen je?",
    options: [
      { key: "1", label: "Pod 130/80" },
      { key: "2", label: "130/80 ali več" },
      { key: "3", label: "Nimam merilnika" },
    ],
  },
];

export const DONE_OK = `Hvala, ${PATIENT_NAME}. Odgovori so shranjeni ✓ Jutri ob 8:00 spet.`;
export const DONE_FLAGGED = `Hvala, ${PATIENT_NAME}. Odgovori so shranjeni ✓ Sestra bo pogledala vaše podatke. Jutri ob 8:00 spet.`;
export const EMERGENCY =
  "Takoj pokličite 112. Bolečina v prsih ali omedlevica je lahko nujno stanje. Ne čakajte. Vaši odgovori še niso poslani.";
