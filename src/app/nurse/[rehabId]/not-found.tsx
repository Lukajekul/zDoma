import { AppShell } from "@/components/shell";

export default function PatientNotFound() {
  return (
    <AppShell title="Rehabilitacije ni bilo mogoče najti" back="/nurse" wide>
      <p>Na seznamu pacientov izberite drugo rehabilitacijo.</p>
    </AppShell>
  );
}
