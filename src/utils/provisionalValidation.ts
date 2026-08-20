export const isFiniteDecimal = (value: string): boolean => {
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim())) return false;
  return Number.isFinite(Number(value));
};

export const isTumorSizeValid = (value: string): boolean =>
  value.trim() === '' || (isFiniteDecimal(value) && Number(value) > 0);

export const isEcogValid = (value: string): boolean => value.trim() === '' || /^[0-4]$/.test(value.trim());

export const isLvefValid = (value: string): boolean =>
  value.trim() === '' || (isFiniteDecimal(value) && Number(value) >= 0 && Number(value) <= 100);