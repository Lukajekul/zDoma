import type { ReactNode } from "react";
import { Leaf } from "lucide-react";
import { BackButton } from "@/components/shell";
import { WaveBand } from "@/components/shell/wave-band";

/**
 * Login screens (design v3): a green band with the zDoma logo in the middle, then the
 * heading and form straight on the canvas, in one readable column on every screen size.
 */
export function LoginFrame({ title, subtitle, back = "/", children }: {
  title: string;
  subtitle?: string;
  back?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col pb-12 sm:px-6">
      <WaveBand className="rounded-b-4xl sm:mt-6 sm:rounded-4xl">
        <div className="flex flex-col items-center gap-3 px-5 pt-4 pb-9 text-center">
          <BackButton href={back} className="min-h-11 self-start px-3 text-base [&_svg]:size-5" />
          <span aria-hidden className="grid size-16 place-items-center rounded-2xl bg-card text-primary shadow-soft">
            <Leaf className="size-8" />
          </span>
          <p className="text-3xl font-extrabold">zDoma</p>
        </div>
      </WaveBand>
      <main className="flex flex-1 flex-col gap-5 px-4 pt-6 sm:px-0">
        <div>
          <h1 className="text-2xl leading-tight font-extrabold text-primary sm:text-3xl">{title}</h1>
          {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
