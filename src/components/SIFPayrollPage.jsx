import React from 'react';
import SIFPayrollForm from './sif/SIFPayrollForm';
import TopNavbar from './TopNavbar';
import ToastHost from './ToastHost';
import SkipLink from './SkipLink';
import CommandPalette from './CommandPalette';
import useAutosaveDebounce from '../hooks/useAutosaveDebounce';

/**
 * SIFPayrollPage
 * Standalone page for WPS SIF Payroll file generation
 * Accessed via /admin/payroll or similar route
 */
export default function SIFPayrollPage() {
  // T-39 — single root-level debounce flushes the autosave pill
  useAutosaveDebounce();

  return (
    <>
      {/* T-40 — first focusable element for keyboard bypass */}
      <SkipLink />
      <TopNavbar />

      <main className="sif-payroll-page" role="main">
        <section className="sif-payroll-page__hero">
          <div className="sif-payroll-page__header">
            <p className="sif-payroll-page__eyebrow">Payroll command center</p>
            <h1>WPS Salary File Generator</h1>
            <p className="sif-payroll-page__subtitle">
              Create and download Mashreq bank-compatible salary payment files for UAE employees
            </p>
          </div>

          <div className="sif-payroll-page__stats" aria-label="Payroll workflow highlights">
            <div className="sif-payroll-page__stat">
              <strong>WPS-ready</strong>
              <span>Structured for bank submission</span>
            </div>
            <div className="sif-payroll-page__stat">
              <strong>Operator-first</strong>
              <span>Faster entry with a clearer review path</span>
            </div>
            <div className="sif-payroll-page__stat">
              <strong>Audit-friendly</strong>
              <span>Built for repeatable monthly processing</span>
            </div>
          </div>
        </section>

        <section className="sif-payroll-page__workspace">
          <div className="sif-payroll-page__container">
            <SIFPayrollForm />
          </div>
        </section>

        <div className="sif-payroll-page__footer">
          <p>
            📋 <strong>About SIF Files:</strong> SIF (Salary Information File) format is required by Mashreq
            Bank for processing salary payments through the UAE Wages Protection System (WPS). Ensure all
            employee information is accurate before generating files.
          </p>
        </div>
      </main>

      <ToastHost />
      <CommandPalette />
    </>
  );
}
