import { LogoutButton } from "@/components/auth/logout-button";
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
      <NurseNav kind={kind} footer={<LogoutButton />} />
      {/* Room for the phone tab bar. */}
      <div className="flex min-w-0 flex-1 flex-col pb-24 lg:pb-0">{children}</div>
    </div>
  );
}
