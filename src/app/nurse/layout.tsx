import { LogoutButton } from "@/components/auth/logout-button";
import { NurseNav } from "@/components/nurse/nurse-nav";

/** Bolničar area: PC-first, with a sidebar on large screens. Pages check staff access themselves. */
export default function NurseLayout({ children }: LayoutProps<"/nurse">) {
  return (
    <div className="flex flex-1">
      <NurseNav footer={<LogoutButton />} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
