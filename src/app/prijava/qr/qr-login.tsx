"use client";

import { useEffect, useState } from "react";
import { BigButton } from "@/components/shell";
import { createClient } from "@/lib/supabase/client";
import { parseQrFragment } from "@/lib/qr/token";
import { davcnaEmail } from "@/lib/types";

type State = "working" | "failed" | "invalid";

/** Reads the token from the URL fragment (never sent to the server) and logs in. */
export function QrLogin() {
  const [state, setState] = useState<State>("working");

  useEffect(() => {
    const parsed = parseQrFragment(window.location.hash);
    // Remove the token from the address bar and history straight away.
    window.history.replaceState(null, "", window.location.pathname);
    if (!parsed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off read of the URL fragment
      setState("invalid");
      return;
    }
    createClient()
      .auth.signInWithPassword({ email: davcnaEmail(parsed.davcna), password: parsed.token })
      .then(({ error }) => {
        if (error) setState("failed");
        else window.location.replace("/patient");
      });
  }, []);

  if (state === "working") {
    return (
      <p role="status" className="text-2xl font-semibold">
        Prijavljam …
      </p>
    );
  }

  return (
    <>
      <p role="alert" className="rounded-3xl border-2 border-status-rdece bg-status-rdece/10 p-4 text-xl font-semibold">
        {state === "failed"
          ? "Ta koda QR ne deluje več. Morda je bila zamenjana z novo."
          : "Kode QR ni bilo mogoče prebrati."}
      </p>
      <p className="text-xl">
        {state === "failed"
          ? "Pokličite patronažno sestro ali oddelek, da vam natisnejo nov prijavni listek."
          : "Poskusite jo skenirati znova s kamero telefona."}
      </p>
      <BigButton href="/prijava" variant="secondary">
        Na prijavo
      </BigButton>
    </>
  );
}
