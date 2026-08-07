import { useCallback, useMemo } from 'react';
import { loadEmiratesIdReferences } from '../records/emiratesIdStore';
import { loadTenantDocumentReferences } from '../records/tenantDocumentStore';
import { loadTitleDeedReferences } from '../records/titleDeedStore';

const readByPath = (obj, path) =>
  String(path)
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

const isMissing = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (typeof value === 'number') return Number.isNaN(value);
  return false;
};

const getMissingFields = (documentData, requiredPaths = []) =>
  requiredPaths.filter((path) => isMissing(readByPath(documentData, path)));

const buildStepBlockCopy = (stepKey, missing = []) => {
  if (stepKey === 'landlord') {
    return {
      title: 'Step 1 blocked — landlord mandatory requirements',
      body: `Complete all required items first: ${missing.join(', ')}`,
    };
  }

  if (stepKey === 'tenant') {
    return {
      title: 'Step 2 blocked — tenant mandatory requirements',
      body: `Complete all required items first: ${missing.join(', ')}`,
    };
  }

  return {
    title: 'Step incomplete',
    body: `Please complete: ${missing.join(', ')}`,
  };
};

const useGateStatus = ({ documentData, steps = [] }) => {
  const landlordGateStatus = useMemo(() => {
    const titleDeedRefs = loadTitleDeedReferences();
    const emiratesIdRefs = loadEmiratesIdReferences();
    const landlordEmiratesIdRefs = emiratesIdRefs.filter((ref) => ref?.ownerTag === 'landlord');

    const missing = [];
    if (!documentData?.landlord?.phone?.trim()) missing.push('landlord.phone');
    if (!documentData?.landlord?.email?.trim()) missing.push('landlord.email');
    if (titleDeedRefs.length === 0) missing.push('landlord.titleDeedUpload');
    if (landlordEmiratesIdRefs.length === 0) missing.push('landlord.emiratesIdUpload');

    return {
      titleDeedCount: titleDeedRefs.length,
      landlordEmiratesIdCount: landlordEmiratesIdRefs.length,
      missing,
      ready: missing.length === 0,
    };
  }, [documentData?.landlord?.email, documentData?.landlord?.phone]);

  const tenantGateStatus = useMemo(() => {
    const emiratesIdRefs = loadEmiratesIdReferences();
    const tenantEmiratesIdRefs = emiratesIdRefs.filter((ref) => ref?.ownerTag === 'tenant');
    const tenantDocRefs = loadTenantDocumentReferences();
    const passportRefs = tenantDocRefs.filter((ref) => ref?.type === 'passport');
    const residencePermitRefs = tenantDocRefs.filter(
      (ref) => ref?.type === 'residence-permit' || ref?.type === 'visa',
    );

    const missing = [];
    if (!documentData?.tenant?.contactNo?.trim()) missing.push('tenant.contactNo');
    if (!documentData?.tenant?.email?.trim()) missing.push('tenant.email');
    if (tenantEmiratesIdRefs.length === 0) missing.push('tenant.emiratesIdUpload');
    if (passportRefs.length === 0) missing.push('tenant.passportUpload');
    if (residencePermitRefs.length === 0) missing.push('tenant.residencePermitUpload');

    return {
      tenantEmiratesIdCount: tenantEmiratesIdRefs.length,
      passportCount: passportRefs.length,
      residencePermitCount: residencePermitRefs.length,
      visaCount: residencePermitRefs.length,
      missing,
      ready: missing.length === 0,
    };
  }, [documentData?.tenant?.contactNo, documentData?.tenant?.email]);

  const completionMap = useMemo(() => {
    return steps.reduce((acc, step) => {
      const missing = getMissingFields(documentData, step.required);
      if (step.key === 'landlord') missing.push(...landlordGateStatus.missing);
      if (step.key === 'tenant') missing.push(...tenantGateStatus.missing);

      acc[step.key] = {
        missing,
        completed: missing.length === 0,
      };

      return acc;
    }, {});
  }, [documentData, landlordGateStatus.missing, steps, tenantGateStatus.missing]);

  const getStepBlockCopyFor = useCallback(
    (stepKey) => buildStepBlockCopy(stepKey, completionMap[stepKey]?.missing || []),
    [completionMap],
  );

  return {
    landlordGateStatus,
    tenantGateStatus,
    completionMap,
    getStepBlockCopy: getStepBlockCopyFor,
  };
};

export default useGateStatus;
