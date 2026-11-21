import { LogOut } from "lucide-react";
import { BigButton } from "@/components/shell";
import { logout } from "@/app/prijava/actions";

/** "Odjava" for any settings/account screen. Signs out this device only. */
export function LogoutButton() {
  return (
    <form action={logout}>
      <BigButton type="submit" variant="secondary" icon={<LogOut />}>
        Odjava
      </BigButton>
    </form>
  );
}
