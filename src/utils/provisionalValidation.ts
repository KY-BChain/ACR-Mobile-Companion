export const isFiniteDecimal = (value: string): boolean => /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim()) && Number.isFinite(Number(value));
export const isOptionalFiniteInRange = (value: string, minimum: number, maximum?: number): boolean => {
  const trimmed = value.trim();
  if (trimmed === '') return true;
  if (!isFiniteDecimal(trimmed)) return false;
  const number = Number(trimmed);
  return number >= minimum && (maximum === undefined || number <= maximum);
};
export const isKi67Valid = (value: string): boolean => value.trim() !== '' && isOptionalFiniteInRange(value, 0, 100);
export const isAgeValid = (value: string): boolean => value.trim() === '' || (/^\d+$/.test(value.trim()) && Number(value) >= 18 && Number(value) <= 120);
export const isMarkerValid = (value: string): boolean => isOptionalFiniteInRange(value, 0);
export const isTumorSizeValid = (value: string): boolean => value.trim() === '' || (isFiniteDecimal(value) && Number(value) > 0);
export const isEcogValid = (value: string): boolean => value.trim() === '' || /^[0-4]$/.test(value.trim());
export const isLvefValid = (value: string): boolean => isOptionalFiniteInRange(value, 0, 100);
export const isIsoDateValid = (value: string): boolean => {
  const trimmed = value.trim();
  if (trimmed === '') return true;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return false;
  const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
