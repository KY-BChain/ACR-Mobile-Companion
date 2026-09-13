/**
 * DDMMYY-HHMMSS in UTC — the Build 46 pairing-record format, identical to the
 * gateway admin `sessions` listing so a date on the phone can be matched to
 * the record.
 */
export function pairingStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const two = (n: number) => String(n).padStart(2, '0');
  return `${two(d.getUTCDate())}${two(d.getUTCMonth() + 1)}${two(d.getUTCFullYear() % 100)}-`
    + `${two(d.getUTCHours())}${two(d.getUTCMinutes())}${two(d.getUTCSeconds())}`;
}
