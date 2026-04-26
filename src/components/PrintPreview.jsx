import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectActiveTemplate, selectCanGeneratePdf, selectDocument } from '../store/selectors';
import { setPreviewRendering, setPreviewReady, setPreviewError } from '../store/uiSlice';

// High-fidelity A4 vector preview. Uses the same render path as Generate PDF
// (`pdf().toBlob()`), so what you see here is byte-identical to the saved file.
//
// Redux integration: dispatches setPreviewRendering → setPreviewReady|setPreviewError
// so PrintButton can gate PDF export on a confirmed fresh render.
const PrintPreview = () => {
  const dispatch = useDispatch();
  const documentData = useSelector(selectDocument);
  const templateKey = useSelector(selectActiveTemplate);
  const canGeneratePdf = useSelector(selectCanGeneratePdf);
  const [blobUrl, setBlobUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState('');
  const lastUrlRef = useRef(null);

  useEffect(() => {
    if (!canGeneratePdf) {
      setStatus('idle');
      return undefined;
    }

    // Signal stale immediately — before the debounce fires — so any
    // "Generate PDF" button is correctly disabled during the render window.
    dispatch(setPreviewRendering());
    let cancelled = false;
    setStatus('loading');

    const handle = setTimeout(async () => {
      try {
        const { generateQuotationPdfBlob } = await import('../pdf/generateQuotationPdf');
        const blob = await generateQuotationPdfBlob({ documentData, templateKey });
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
        lastUrlRef.current = url;
        setBlobUrl(url);
        setStatus('ready');
        dispatch(setPreviewReady());
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || 'Failed to render preview');
        setStatus('error');
        dispatch(setPreviewError());
      }
    }, 300); // 300 ms debounce — avoids thrashing while user types

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [documentData, templateKey, canGeneratePdf, dispatch]);

  useEffect(
    () => () => {
      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
    },
    [],
  );

  if (!canGeneratePdf) {
    return (
      <div className="print-preview-empty">
        <p>This template does not yet support a vector PDF preview.</p>
      </div>
    );
  }

  return (
    <div className="print-preview-wrap" aria-live="polite">
      {status === 'loading' && <div className="print-preview-status">Rendering A4 preview…</div>}
      {status === 'error' && <div className="print-preview-status error">Preview error: {error}</div>}
      {blobUrl ? (
        <iframe
          key={blobUrl}
          src={`${blobUrl}#toolbar=1&navpanes=0`}
          title="Document A4 print preview"
          className="print-preview-iframe"
        />
      ) : null}
    </div>
  );
};

export default React.memo(PrintPreview);
