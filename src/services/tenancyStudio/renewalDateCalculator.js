/**
 * [Category 5: Processing Engine]
 * Smart +1 Year Renewal Date Advancement Engine
 * Parses multiple UAE real estate date formats (DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD)
 * and advances the tenancy period forward by exactly 1 calendar year with leap-year awareness.
 */

export function parseFlexibleDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const cleaned = dateStr.trim();

  // 1. ISO: YYYY-MM-DD
  const isoMatch = cleaned.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const dt = new Date(y, m, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // 2. UAE Standard: DD-MM-YYYY or DD/MM/YYYY
  const uaeMatch = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (uaeMatch) {
    const d = parseInt(uaeMatch[1], 10);
    const m = parseInt(uaeMatch[2], 10) - 1;
    const y = parseInt(uaeMatch[3], 10);
    const dt = new Date(y, m, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  return null;
}

export function formatUaeDate(date) {
  if (!date || isNaN(date.getTime())) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

export function advanceRenewalDates(startDateStr, endDateStr) {
  const startDate = parseFlexibleDate(startDateStr);
  const endDate = parseFlexibleDate(endDateStr);

  let newStartDateStr = '';
  let newEndDateStr = '';

  if (startDate) {
    const newStart = new Date(startDate);
    newStart.setFullYear(newStart.getFullYear() + 1);
    newStartDateStr = formatUaeDate(newStart);
  }

  if (endDate) {
    const newEnd = new Date(endDate);
    newEnd.setFullYear(newEnd.getFullYear() + 1);
    newEndDateStr = formatUaeDate(newEnd);
  }

  return {
    startDate: newStartDateStr,
    endDate: newEndDateStr,
    contractDate: formatUaeDate(new Date()),
  };
}
