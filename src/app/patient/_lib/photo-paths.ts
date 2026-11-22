/** Most wound photos one check-in can carry (T-72). */
export const MAX_PHOTOS = 2;

/** Keeps at most two upload paths that live in this rehabilitacija's folder. */
export function cleanPhotoPaths(rehabId: string, paths: unknown): { photo_path: string | null; photo_path_2: string | null } {
  const ok = (Array.isArray(paths) ? paths : [])
    .filter((p): p is string => typeof p === "string" && p.startsWith(`${rehabId}/`) && !p.includes(".."))
    .slice(0, MAX_PHOTOS);
  return { photo_path: ok[0] ?? null, photo_path_2: ok[1] ?? null };
}
