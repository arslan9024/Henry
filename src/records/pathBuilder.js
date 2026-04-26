const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'long' });

export const sanitizePathSegment = (value = '') =>
  String(value)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_') || 'Unknown';

export const buildPropertyFolderName = (property = {}) => {
  const community = sanitizePathSegment(property.community || property.cluster || 'Property');
  const unit = sanitizePathSegment(property.unit || 'Unit');
  return `${community}_${unit}`;
};

export const buildLogicalRecordPath = ({ createdAt, property }) => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const year = String(date.getFullYear());
  const month = sanitizePathSegment(MONTH_FORMATTER.format(date));
  const propertyName = buildPropertyFolderName(property);

  return `/records/${year}/${month}/${propertyName}/`;
};
