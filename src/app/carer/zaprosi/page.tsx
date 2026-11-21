import { AppShell } from "@/components/shell";
import { RequestForm } from "./_components/request-form";

export default function ZaprosiPage() {
  return (
    <AppShell title="Zaprosi za dostop" back="/carer">
      <p className="text-xl">
        Vpišite davčno številko osebe, ki ji pomagate. Ta oseba bo na svojem telefonu potrdila, da lahko spremljate njeno
        okrevanje.
      </p>
      <RequestForm />
    </AppShell>
  );
}
