import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useFocusTrap from './useFocusTrap';

/**
 * Test harness: a simple modal with three buttons inside, an outside trigger,
 * and a flag to toggle the trap on/off.
 */
const TrapHarness = ({ initialActive = false }) => {
  const [active, setActive] = useState(initialActive);
  const ref = useFocusTrap(active);
  return (
    <>
      <button data-testid="outside" onClick={() => setActive(true)}>
        open
      </button>
      {active ? (
        <div ref={ref} data-testid="trap" tabIndex={-1}>
          <button data-testid="first">first</button>
          <button data-testid="middle">middle</button>
          <button data-testid="last" onClick={() => setActive(false)}>
            last (close)
          </button>
        </div>
      ) : null}
    </>
  );
};

// Microtask flush helper — useFocusTrap defers initial focus via queueMicrotask.
const flushMicrotasks = () => act(() => Promise.resolve());

describe('useFocusTrap', () => {
  it('moves focus into the container when activated', async () => {
    const user = userEvent.setup();
    render(<TrapHarness />);
    await user.click(screen.getByTestId('outside'));
    await flushMicrotasks();
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('Tab from the last focusable wraps to the first', async () => {
    const user = userEvent.setup();
    render(<TrapHarness />);
    await user.click(screen.getByTestId('outside'));
    await flushMicrotasks();
    screen.getByTestId('last').focus();
    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('Shift+Tab from the first focusable wraps to the last', async () => {
    const user = userEvent.setup();
    render(<TrapHarness />);
    await user.click(screen.getByTestId('outside'));
    await flushMicrotasks();
    screen.getByTestId('first').focus();
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(screen.getByTestId('last'));
  });

  it('restores focus to the previously-focused element when deactivated', async () => {
    const user = userEvent.setup();
    render(<TrapHarness />);
    const trigger = screen.getByTestId('outside');
    trigger.focus();
    await user.click(trigger);
    await flushMicrotasks();
    // Now close via the last button — but we need the previously-focused
    // element (trigger) to be where focus returns.
    await user.click(screen.getByTestId('last'));
    expect(document.activeElement).toBe(trigger);
  });

  it('does nothing when active is false (focus is unconstrained)', async () => {
    render(<TrapHarness />);
    expect(screen.queryByTestId('trap')).toBeNull();
    // Body still receives default focus; no error.
    expect(document.activeElement).toBe(document.body);
  });

  it('Tab in a container with no focusable elements is prevented without throwing', async () => {
    // A harness whose trap has no focusable children.
    const EmptyTrap = () => {
      const [active, setActive] = React.useState(false);
      const ref = useFocusTrap(active);
      return (
        <>
          <button data-testid="open" onClick={() => setActive(true)}>
            open
          </button>
          {active ? (
            <div ref={ref} data-testid="empty-trap" tabIndex={-1}>
              <span>no buttons here</span>
            </div>
          ) : null}
        </>
      );
    };
    const user = userEvent.setup();
    render(<EmptyTrap />);
    await user.click(screen.getByTestId('open'));
    await flushMicrotasks();
    // Tab should not throw even with no focusable elements.
    await expect(user.keyboard('{Tab}')).resolves.not.toThrow();
  });

  it('deactivating the trap tries to restore focus and handles stale/detached nodes silently', async () => {
    // A harness that unmounts the previously-focused element before restoring focus.
    const StaleFocusHarness = () => {
      const [showTrigger, setShowTrigger] = React.useState(true);
      const [active, setActive] = React.useState(false);
      const ref = useFocusTrap(active);
      return (
        <>
          {showTrigger ? (
            <button
              data-testid="trigger"
              onClick={() => {
                setShowTrigger(false); // unmount trigger before trap activates
                setActive(true);
              }}
            >
              open
            </button>
          ) : null}
          {active ? (
            <div ref={ref} data-testid="stale-trap" tabIndex={-1}>
              <button data-testid="close" onClick={() => setActive(false)}>
                close
              </button>
            </div>
          ) : null}
        </>
      );
    };
    const user = userEvent.setup();
    render(<StaleFocusHarness />);
    // Click trigger — it disappears and trap activates.
    await user.click(screen.getByTestId('trigger'));
    await flushMicrotasks();
    // Close the trap — previouslyFocusedRef points to the now-removed button.
    // The catch block should swallow any focus error.
    await expect(user.click(screen.getByTestId('close'))).resolves.not.toThrow();
  });
});
