"use client";

import { useState } from "react";
import {
  ALWAYS_ASKED,
  DETAIL_QUESTIONS,
  DONE_FLAGGED,
  DONE_OK,
  EMERGENCY,
  GREETING,
  SAME_AS_YESTERDAY,
  type MockOption,
  type MockQuestion,
} from "./script";

export type MockStatus = "asking" | "done" | "emergency";
export type MockMessage = { from: "zdoma" | "patient"; text: string };
type Answers = Record<string, MockOption>;

/** Order: always-asked questions, then "Enako kot včeraj", then the rest if needed. */
function nextQuestion(answers: Answers): MockQuestion | null {
  for (const q of ALWAYS_ASKED) if (!answers[q.id]) return q;
  const same = answers[SAME_AS_YESTERDAY.id];
  if (!same) return SAME_AS_YESTERDAY;
  if (same.key === "1") return null;
  for (const q of DETAIL_QUESTIONS) if (!answers[q.id]) return q;
  return null;
}

/** Question text with its numbered answers, as sent by SMS or read out on the phone. */
export function questionPrompt(q: MockQuestion, verb: "Odgovorite" | "Pritisnite") {
  const opts = q.options.map((o) => `${o.key} = ${o.label}`).join("\n");
  return `${q.text}\n${verb}:\n${opts}`;
}

type State = { answers: Answers; emergency: boolean; log: MockMessage[] };

function initial(verb: "Odgovorite" | "Pritisnite"): State {
  return {
    answers: {},
    emergency: false,
    log: [{ from: "zdoma", text: `${GREETING}\n\n${questionPrompt(ALWAYS_ASKED[0], verb)}` }],
  };
}

/** Click-through state for the mock-up. Nothing is saved anywhere. */
export function useMockCheckin(verb: "Odgovorite" | "Pritisnite") {
  const [state, setState] = useState<State>(() => initial(verb));
  const question = state.emergency ? null : nextQuestion(state.answers);
  const status: MockStatus = state.emergency ? "emergency" : question ? "asking" : "done";

  /** Returns false when the key isn't one of the current answers. */
  function answer(key: string): boolean {
    if (!question) return false;
    const option = question.options.find((o) => o.key === key);
    if (!option) return false;

    const patientMsg: MockMessage = { from: "patient", text: key };
    if (option.emergency) {
      setState((s) => ({ ...s, emergency: true, log: [...s.log, patientMsg, { from: "zdoma", text: EMERGENCY }] }));
      return true;
    }
    const answers = { ...state.answers, [question.id]: option };
    const next = nextQuestion(answers);
    const flagged = Object.values(answers).some((a) => a.flag);
    const reply = next ? questionPrompt(next, verb) : flagged ? DONE_FLAGGED : DONE_OK;
    setState((s) => ({ ...s, answers, log: [...s.log, patientMsg, { from: "zdoma", text: reply }] }));
    return true;
  }

  return {
    question,
    status,
    log: state.log,
    answer,
    restart: () => setState(initial(verb)),
  };
}
