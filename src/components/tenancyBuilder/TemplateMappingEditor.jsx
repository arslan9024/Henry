import React, { useEffect, useMemo, useState } from 'react';
import { fetchRecordFile } from '../../records/archiveService';
import { inspectFillablePdfFields } from '../../pdf/templatePdfService';
import { Button, FormField, Input, Select } from '../ui';

const defaultStaticMapping = (field, index) => ({
  fieldId: field.id,
  path: field.path,
  labelEn: field.labelEn,
  labelAr: field.labelAr,
  page: 1,
  x: 48,
  y: Math.max(40, 760 - index * 24),
  width: 220,
  fontSize: 10,
});

const defaultFillableMapping = (field) => ({
  fieldId: field.id,
  path: field.path,
  labelEn: field.labelEn,
  labelAr: field.labelAr,
  pdfFieldName: '',
});

const TemplateMappingEditor = ({ template, fields, onSave, onNotify }) => {
  const mode = template?.mode === 'fillable' ? 'fillable' : 'static';
  const [mappings, setMappings] = useState([]);
  const [pdfFields, setPdfFields] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isWorkingCopy = template?.kind === 'working-copy';

  const persistedPath = template?.sourcePersistedPath || template?.persistedPath;
  const mappedCount = useMemo(
    () =>
      mappings.filter((mapping) =>
        mode === 'fillable' ? Boolean(mapping.pdfFieldName) : Number(mapping.page) > 0,
      ).length,
    [mappings, mode],
  );

  useEffect(() => {
    const stored = template?.mappingProfile;
    setMappings(
      stored?.mode === mode && Array.isArray(stored.mappings)
        ? stored.mappings
        : fields.map(mode === 'fillable' ? defaultFillableMapping : defaultStaticMapping),
    );
    setPdfFields([]);
  }, [fields, mode, template?.id, template?.mappingProfile]);

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    if (!persistedPath) return undefined;

    fetchRecordFile(persistedPath).then((result) => {
      if (!active || !result.ok) return;
      objectUrl = URL.createObjectURL(result.blob);
      setPreviewUrl(objectUrl);
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [persistedPath]);

  const updateMapping = (index, key, value) => {
    setMappings((current) =>
      current.map((mapping, itemIndex) => (itemIndex === index ? { ...mapping, [key]: value } : mapping)),
    );
  };

  const inspectFields = async () => {
    setIsLoading(true);
    try {
      const result = await fetchRecordFile(persistedPath);
      if (!result.ok) throw new Error(result.reason || 'Template binary unavailable.');
      const detected = await inspectFillablePdfFields(result.blob);
      setPdfFields(detected);
      onNotify?.(
        detected.length ? 'success' : 'warning',
        'Fillable field inspection complete',
        detected.length ? `${detected.length} AcroForm fields detected.` : 'No AcroForm fields detected.',
      );
    } catch (error) {
      onNotify?.('error', 'Could not inspect template', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = () => {
    onSave({
      mode,
      mappings,
      flatten: false,
      profileVersion: 1,
      savedAt: new Date().toISOString(),
    });
  };

  return (
    <section className="tenancy-mapping-editor" aria-label="Template mapping editor">
      <div className="tenancy-mapping-editor__header">
        <div>
          <h4>{mode === 'fillable' ? 'Fillable PDF field editor' : 'Static coordinate mapping editor'}</h4>
          <p>
            {mode === 'fillable'
              ? 'Map Henry document fields to detected AcroForm names.'
              : 'Coordinates use PDF points from the bottom-left of each page.'}
          </p>
        </div>
        <span>
          {mappedCount}/{mappings.length} mapped
        </span>
      </div>

      {!isWorkingCopy ? (
        <p className="tenancy-mapping-editor__guard" role="status">
          Master template is read-only. Create an editable copy before changing mappings.
        </p>
      ) : null}

      {previewUrl ? (
        <iframe
          className="tenancy-mapping-editor__preview"
          src={previewUrl}
          title="Tenancy PDF template preview"
        />
      ) : (
        <p className="tenancy-builder-note">
          PDF preview becomes available when the persisted template loads.
        </p>
      )}

      {mode === 'fillable' ? (
        <Button variant="secondary" size="sm" onClick={inspectFields} disabled={isLoading || !persistedPath}>
          {isLoading ? 'Inspecting…' : 'Detect AcroForm fields'}
        </Button>
      ) : null}

      <div className="tenancy-mapping-editor__rows">
        {mappings.map((mapping, index) => (
          <div className="tenancy-mapping-row" key={mapping.fieldId || mapping.path}>
            <div className="tenancy-mapping-row__label">
              <strong>{mapping.labelEn}</strong>
              <span lang="ar" dir="rtl">
                {mapping.labelAr}
              </span>
              <code>{mapping.path}</code>
            </div>
            {mode === 'fillable' ? (
              <FormField label="PDF field">
                <Select
                  value={mapping.pdfFieldName || ''}
                  onChange={(event) => updateMapping(index, 'pdfFieldName', event.target.value)}
                  disabled={!isWorkingCopy}
                  options={[
                    { value: '', label: 'Not mapped' },
                    ...pdfFields.map((field) => ({
                      value: field.name,
                      label: `${field.name} (${field.type})`,
                    })),
                  ]}
                />
              </FormField>
            ) : (
              <div className="tenancy-mapping-row__coordinates">
                {['page', 'x', 'y', 'width', 'fontSize'].map((key) => (
                  <FormField label={key === 'fontSize' ? 'Font' : key.toUpperCase()} key={key}>
                    <Input
                      type="number"
                      min={key === 'page' ? 1 : 0}
                      value={mapping[key]}
                      onChange={(event) => updateMapping(index, key, Number(event.target.value))}
                      disabled={!isWorkingCopy}
                    />
                  </FormField>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button variant="primary" onClick={saveProfile} disabled={!isWorkingCopy || mappings.length === 0}>
        Save mapping profile
      </Button>
    </section>
  );
};

export default TemplateMappingEditor;
