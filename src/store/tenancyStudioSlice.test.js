import { describe, it, expect } from 'vitest';
import reducer, {
  setCurrentStep,
  setActiveViewingPage,
  setZoom,
  setSelectedFieldKey,
  updatePage1Field,
  updateFieldCoordinate,
  nudgeFieldCoordinate,
  resetCoordinatesToDefault,
  setToolboxOption,
} from './tenancyStudioSlice';

describe('tenancyStudioSlice', () => {
  it('updates current workflow step', () => {
    const state = reducer(undefined, setCurrentStep(2));
    expect(state.currentStep).toBe(2);
  });

  it('updates page 1 field and syncs to addendum and receipt', () => {
    const state = reducer(undefined, updatePage1Field({ field: 'tenant_name', value: 'Fatima Al Mansoori' }));
    expect(state.page1.tenant_name).toBe('Fatima Al Mansoori');
    expect(state.addendumParams.tenant_name).toBe('Fatima Al Mansoori');
    expect(state.receiptParams.tenant_name).toBe('Fatima Al Mansoori');
  });

  it('nudges coordinates by dx and dy with clamping', () => {
    const initial = reducer(undefined, { type: '@@INIT' });
    const originalX = initial.coordinates.page1.tenant_name.x;
    const originalY = initial.coordinates.page1.tenant_name.y;

    const state = reducer(initial, nudgeFieldCoordinate({ page: 1, fieldKey: 'tenant_name', dx: 3, dy: -2 }));
    expect(state.coordinates.page1.tenant_name.x).toBe(originalX + 3);
    expect(state.coordinates.page1.tenant_name.y).toBe(originalY - 2);
  });

  it('resets coordinates to default mapper', () => {
    const modified = reducer(
      undefined,
      updateFieldCoordinate({ page: 1, fieldKey: 'tenant_name', x: 200, y: 300 }),
    );
    expect(modified.coordinates.page1.tenant_name.x).toBe(200);

    const resetState = reducer(modified, resetCoordinatesToDefault());
    expect(resetState.coordinates.page1.tenant_name.x).toBe(98);
  });

  it('supports undo and redo for coordinate modifications', () => {
    const initial = reducer(undefined, { type: '@@INIT' });
    const originalX = initial.coordinates.page1.tenant_name.x;

    const state1 = reducer(
      initial,
      updateFieldCoordinate({ page: 1, fieldKey: 'tenant_name', x: 250, y: 350 }),
    );
    expect(state1.coordinates.page1.tenant_name.x).toBe(250);

    const undone = reducer(state1, { type: 'tenancyStudio/undoCoordinateChange' });
    expect(undone.coordinates.page1.tenant_name.x).toBe(originalX);

    const redone = reducer(undone, { type: 'tenancyStudio/redoCoordinateChange' });
    expect(redone.coordinates.page1.tenant_name.x).toBe(250);
  });

  it('applies deal preset and updates cheques and deposit', () => {
    const presetState = reducer(undefined, {
      type: 'tenancyStudio/applyDealPreset',
      payload: 'marina-1br',
    });
    expect(presetState.page1.building_name).toContain('Marina Gate 1');
    expect(presetState.chequeCount).toBe(2);
    expect(presetState.page1.mode_of_payment).toBe('2 Cheques');
  });

  it('updates toolbox settings', () => {
    const state = reducer(undefined, setToolboxOption({ key: 'documentScope', value: 'contract-only' }));
    expect(state.toolbox.documentScope).toBe('contract-only');
  });
});
