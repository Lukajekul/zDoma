import { Pill } from "lucide-react";

/**
 * Picture of the medicine box. Uses `photo_url` when there is one; otherwise a
 * plain drawn box with the name, so the patient can match it to the real pack.
 */
export function MedicineBox({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- photo URLs are external (pharmacy database)
    return <img src={photoUrl} alt={`Škatla zdravila ${name}`} className="h-20 w-24 shrink-0 sm:h-24 sm:w-32 rounded-lg border object-contain" />;
  }
  return (
    <div
      role="img"
      aria-label={`Škatla zdravila ${name}`}
      className="flex h-20 w-24 shrink-0 sm:h-24 sm:w-32 flex-col items-center justify-center gap-1 rounded-xl bg-card shadow-soft bg-muted px-2 text-center"
    >
      <Pill aria-hidden className="size-6 text-muted-foreground" />
      <span className="text-base leading-tight font-bold break-words">{name}</span>
    </div>
  );
}
