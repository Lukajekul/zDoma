import { CircleCheck, CircleAlert, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Traffic-light status. Align with T-03/T-04 types when they land. */
export type Status = "zeleno" | "rumeno" | "rdece";

const config = {
  zeleno: { word: "Zeleno", meaning: "vse v redu", Icon: CircleCheck, cls: "bg-status-zeleno-bg text-status-zeleno border-transparent" },
  rumeno: { word: "Rumeno", meaning: "sestra bo pogledala", Icon: CircleAlert, cls: "bg-status-rumeno-bg text-status-rumeno border-transparent" },
  rdece: { word: "Rdeče", meaning: "potrebna pozornost", Icon: TriangleAlert, cls: "bg-status-rdece-bg text-status-rdece border-transparent" },
} as const;

type StatusBadgeProps = {
  status: Status;
  /** Override the default meaning text ("vse v redu" …). */
  label?: string;
  /** Word only ("Rdeče"), for tight lists such as the nurse dashboard. */
  short?: boolean;
  className?: string;
};

/** Status as word + colour + icon, never colour alone (AGENTS.md §7). */
export function StatusBadge({ status, label, short = false, className }: StatusBadgeProps) {
  const { word, meaning, Icon, cls } = config[status];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border-2 px-3.5 py-1 text-lg font-semibold",
        cls,
        className,
      )}
    >
      <Icon aria-hidden className="size-6 shrink-0" />
      {short ? word : `${word} – ${label ?? meaning}`}
    </span>
  );
}
