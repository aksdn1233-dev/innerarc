export function isAdminEmail(
  email: string | null | undefined,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  if (!email) return false;
  const allowed = (environment.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
