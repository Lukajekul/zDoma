/**
 * Sets (or clears) one dashboard filter in the URL without a server round trip.
 * `useSearchParams()` picks the change up, so every dashboard piece stays in sync.
 */
export function setDashboardParam(key: string, value: string | null) {
  const latest = new URLSearchParams(window.location.search);
  if (key === "obcina") latest.delete("kraj");
  if (value) latest.set(key, value);
  else latest.delete(key);
  const search = latest.toString();
  if (search === window.location.search.slice(1)) return;
  window.history.pushState(null, "", search ? `?${search}` : window.location.pathname);
}

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
