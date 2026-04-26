export const parseDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  if (typeof value === 'string') {
    const normalized = value.replace(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/, '$1 $2 $3');
    const fallback = new Date(normalized);
    if (!Number.isNaN(fallback.getTime())) return fallback;
  }

  return null;
};

export const differenceInDays = (fromValue, toValue) => {
  const from = parseDateValue(fromValue);
  const to = parseDateValue(toValue);
  if (!from || !to) return null;

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / millisecondsPerDay);
};

export const todayDate = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const formatDateDisplay = (value) => {
  const parsed = parseDateValue(value);
  if (!parsed) return 'Not set';

  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const sanitizeNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const normalized = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(normalized) ? normalized : 0;
};

export const getReraAllowedIncreasePercent = ({ currentRent, marketRent }) => {
  const current = sanitizeNumber(currentRent);
  const market = sanitizeNumber(marketRent);

  if (!current || !market || current >= market) return 0;

  const gapPercent = ((market - current) / market) * 100;

  if (gapPercent <= 10) return 0;
  if (gapPercent <= 20) return 5;
  if (gapPercent <= 30) return 10;
  if (gapPercent <= 40) return 15;
  return 20;
};

export const formatCurrency = (value) => `AED ${sanitizeNumber(value).toLocaleString('en-US')}`;
