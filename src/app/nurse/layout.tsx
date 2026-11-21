import { LogOut, UserRound } from "lucide-react";
import { logout } from "@/app/prijava/actions";
import { WaveBand } from "@/components/shell/wave-band";
import { NurseNav } from "@/components/nurse/nurse-nav";
import { getCurrentProfile } from "@/lib/auth";
import { getStaffKind } from "@/lib/staff";

/**
 * Bolničar area: a sidebar on large screens. The menu depends on the kind of staff (T-57):
 * a patronažna sestra (has a teren) or hospital staff. Pages check staff access themselves.
 */
export default async function NurseLayout({ children }: LayoutProps<"/nurse">) {
  const profile = await getCurrentProfile();
  const { kind } = profile?.is_staff ? await getStaffKind(profile.id) : { kind: "bolnisnica" as const };
  return (
    <div className="flex flex-1">
      <NurseNav
        kind={kind}
        footer={
          <WaveBand className="rounded-3xl">
            <div className="flex flex-col gap-1 p-4">
              <span aria-hidden className="mb-2 grid size-9 place-items-center rounded-xl bg-card text-primary"><UserRound className="size-5" /></span>
              <p className="font-bold">{profile ? `${profile.first_name} ${profile.last_name}` : "Prijavljeni"}</p>
              <p className="mb-3 text-base">{kind === "patronaza" ? "Patronažna sestra" : "Bolnišnica"}</p>
              <form action={logout}>
                <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-card font-bold text-brand-ink hover:bg-brand-soft">
                  <LogOut aria-hidden className="size-5" /> Odjava
                </button>
              </form>
            </div>
          </WaveBand>
        }
      />
      {/* Room for the phone tab bar. */}
      <div className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">{children}</div>
    </div>
  );
}
