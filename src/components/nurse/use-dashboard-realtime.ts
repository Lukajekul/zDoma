import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useDashboardRealtime() {
  const router = useRouter();
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const refresh = () => {
      if (disposed) return;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 150);
    };

    const channel = supabase
      .channel("nurse-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "rehabilitacije" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, refresh)
      .subscribe((status) => {
        if (disposed) return;
        setUnavailable(status !== "SUBSCRIBED");
        if (status === "SUBSCRIBED") refresh();
      });

    window.addEventListener("focus", refresh);
    return () => {
      disposed = true;
      window.removeEventListener("focus", refresh);
      clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return unavailable;
}
