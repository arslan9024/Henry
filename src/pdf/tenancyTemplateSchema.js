import schema from './tenancyTemplateSchema.json';

const readByPath = (obj, path) =>
  String(path)
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

const isMissing = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (typeof value === 'number') return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

export const TENANCY_TEMPLATE_SCHEMA = schema;

export const getTenancyTemplateSchema = () => TENANCY_TEMPLATE_SCHEMA;

export const getTenancyMinimumRequiredFields = () => TENANCY_TEMPLATE_SCHEMA.minimumRequiredFields || [];

export const evaluateTenancyAutofillReadiness = (documentData) => {
  const required = getTenancyMinimumRequiredFields();
  const missing = required.filter((path) => isMissing(readByPath(documentData, path)));

  return {
    requiredCount: required.length,
    completedCount: required.length - missing.length,
    missing,
    ready: missing.length === 0,
  };
};
