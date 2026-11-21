// QR login link format (AGENTS.md §6): /prijava/qr#<davcna>.<token>
// The fragment never reaches the server or its logs. The davčna številka is not
// secret; the token (256 random bits, base64url) is the account password.

export const QR_PATH = "/prijava/qr";

export function qrFragment(davcna: string, token: string): string {
  return `${davcna}.${token}`;
}

export function parseQrFragment(hash: string): { davcna: string; token: string } | null {
  const m = /^#?([0-9]{8})\.([A-Za-z0-9_-]{22,})$/.exec(hash.trim());
  return m ? { davcna: m[1], token: m[2] } : null;
}
