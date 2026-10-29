/**
 * [Category 1: View - OPTION 2 EMBEDDED ROUTE]
 * White Caves Real Estate - Classic Legacy Studio Wrapper Page
 * Embeds the untouched standalone client-side module (importantFolder/main_entry.html)
 * inside an isolated iframe sandbox with full navigation back to Henry's modern React suite.
 */

import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { APP_PAGES, navigateToPage } from '../../store/appRouteSlice';

export const ClassicStudioPage = () => {
  const dispatch = useDispatch();
  const iframeRef = useRef(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = '/importantFolder/main_entry.html';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        backgroundColor: '#0f172a',
      }}
    >
      {/* Top Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '10px 20px',
          backgroundColor: '#1e293b',
          color: '#ffffff',
          borderBottom: '1px solid #334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🏛️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#f8fafc', fontWeight: 'bold' }}>
              Classic Tenancy Studio (Standalone Offline Engine)
            </h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
              Running untouched in sandboxed container directly from{' '}
              <code>importantFolder/main_entry.html</code>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleReload}
            style={{
              padding: '6px 12px',
              backgroundColor: '#334155',
              color: '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '5px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ↻ Reload Sandbox
          </button>

          <a
            href="/importantFolder/main_entry.html"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '6px 12px',
              backgroundColor: '#334155',
              color: '#38bdf8',
              border: '1px solid #0284c7',
              borderRadius: '5px',
              fontSize: '12px',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            ↗ Open in New Tab
          </a>

          <button
            type="button"
            onClick={() => dispatch(navigateToPage(APP_PAGES.TENANCY_STUDIO))}
            style={{
              padding: '6px 14px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '5px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ✨ Switch to Modern React Studio
          </button>
        </div>
      </div>

      {/* Embedded Iframe */}
      <iframe
        ref={iframeRef}
        src="/importantFolder/main_entry.html"
        title="Classic Tenancy Studio"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          backgroundColor: '#ffffff',
        }}
      />
    </div>
  );
};

export default ClassicStudioPage;
