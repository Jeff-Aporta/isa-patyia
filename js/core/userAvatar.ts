/** Avatar generado por nombre vía UI Avatars (https://ui-avatars.com). */

export function buildUserAvatarUrl(name: string | null | undefined, size = 72): string {
  const label = String(name ?? "").trim() || "Usuario";
  const params = new URLSearchParams({
    name: label,
    size: String(size),
    background: "1e90ff",
    color: "ffffff",
    bold: "true",
    format: "svg",
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}
