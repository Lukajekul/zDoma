/** Reminds the zadolženec that entries are made with the patient and saved under their own name. */
export function TogetherNote({ name }: { name: string }) {
  return (
    <p className="rounded-3xl bg-card shadow-soft p-4 text-lg">
      Označite samo tisto, kar ste naredili skupaj s pacientom: <strong>{name}</strong>. Vnos se shrani z vašim
      imenom in ga vidita pacient in sestra.
    </p>
  );
}
