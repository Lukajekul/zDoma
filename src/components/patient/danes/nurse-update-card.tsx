import Image from "next/image";
import type { NurseUpdate } from "@/app/patient/_lib/nurse-update";
import { formatDate } from "@/lib/format";

export function NurseUpdateCard({ update }: { update: NurseUpdate }) {
  return (
    <section aria-label="Sporočilo o okrevanju" className="rounded-3xl bg-card p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div aria-hidden className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">
          <span>{update.initials}</span>
          {update.photoUrl && (
            <Image
              alt=""
              className="object-cover"
              fill
              referrerPolicy="no-referrer"
              sizes="63px"
              src={update.photoUrl}
              unoptimized
            />
          )}
        </div>
        <div className="min-w-0 wrap-break-word">
          <p className="font-semibold">{update.author}</p>
          <time className="text-muted-foreground" dateTime={update.date}>{formatDate(update.date)}</time>
        </div>
      </div>
      <p className="mt-3 text-xl leading-snug font-semibold">{update.text}</p>
    </section>
  );
}
