import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import Button from './Button';
import IconButton from './IconButton';
import Badge from './Badge';
import Card from './Card';
import Spinner from './Spinner';
import Skeleton from './Skeleton';
import clsx from './clsx';

afterEach(cleanup);

describe('clsx', () => {
  it('joins truthy strings + handles falsy + objects + arrays', () => {
    expect(clsx('a', null, undefined, false, 'b')).toBe('a b');
    expect(clsx('a', { 'is-active': true, 'is-disabled': false }, 'b')).toBe('a is-active b');
    expect(clsx(['a', ['b', { c: true }]], 'd')).toBe('a b c d');
    expect(clsx()).toBe('');
  });
});

describe('Button', () => {
  it('renders children with default variant=secondary, size=md', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toHaveAttribute('data-variant', 'secondary');
    expect(btn).toHaveAttribute('data-size', 'md');
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).not.toBeDisabled();
  });

  it('respects variant + size + fullWidth + custom type', () => {
    render(
      <Button variant="primary" size="lg" fullWidth type="submit">
        Generate
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Generate' });
    expect(btn).toHaveAttribute('data-variant', 'primary');
    expect(btn).toHaveAttribute('data-size', 'lg');
    expect(btn).toHaveAttribute('data-full-width', 'true');
    expect(btn).toHaveAttribute('type', 'submit');
  });

  it('loading: disables, sets aria-busy, renders spinner', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Saving' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toHaveAttribute('data-loading', 'true');
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled: blocks click', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Cancel
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders iconLeft + iconRight slots aria-hidden', () => {
    render(
      <Button iconLeft={<span data-testid="left">L</span>} iconRight={<span data-testid="right">R</span>}>
        Go
      </Button>,
    );
    // The icon WRAPPER is aria-hidden
    expect(screen.getByTestId('left').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('right').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards ref to the underlying button', () => {
    const ref = { current: null };
    render(<Button ref={ref}>Tap</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

describe('IconButton', () => {
  it('renders with required aria-label', () => {
    render(<IconButton aria-label="Close drawer">✕</IconButton>);
    const btn = screen.getByRole('button', { name: 'Close drawer' });
    expect(btn).toHaveAttribute('data-variant', 'ghost');
    expect(btn).toHaveAttribute('data-size', 'md');
  });

  it('warns in dev when aria-label is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<IconButton>?</IconButton>);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('honours variant/size/disabled', () => {
    render(
      <IconButton aria-label="Solid" variant="solid" size="lg" disabled>
        ◀
      </IconButton>,
    );
    const btn = screen.getByRole('button', { name: 'Solid' });
    expect(btn).toHaveAttribute('data-variant', 'solid');
    expect(btn).toHaveAttribute('data-size', 'lg');
    expect(btn).toBeDisabled();
  });
});

describe('Badge', () => {
  it('renders text badge with default tone=neutral, size=md', () => {
    render(<Badge>3 critical</Badge>);
    const el = screen.getByText('3 critical');
    expect(el).toHaveAttribute('data-tone', 'neutral');
    expect(el).toHaveAttribute('data-size', 'md');
    expect(el).toHaveClass('ui-badge');
  });

  it('honours tone + size props', () => {
    render(
      <Badge tone="critical" size="sm">
        12
      </Badge>,
    );
    const el = screen.getByText('12');
    expect(el).toHaveAttribute('data-tone', 'critical');
    expect(el).toHaveAttribute('data-size', 'sm');
  });

  it('dot variant renders an aria-hidden circle with no text', () => {
    const { container } = render(<Badge tone="success" dot data-testid="d" />);
    const dot = container.querySelector('.ui-badge-dot');
    expect(dot).not.toBeNull();
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(dot).toHaveAttribute('data-tone', 'success');
  });
});

describe('Card', () => {
  it('renders default surface card with md padding wrapping children', () => {
    render(
      <Card>
        <p>hello</p>
      </Card>,
    );
    const card = screen.getByText('hello').parentElement;
    expect(card).toHaveAttribute('data-variant', 'surface');
    expect(card).toHaveAttribute('data-padding', 'md');
    expect(card).toHaveClass('ui-card');
  });

  it('renders Header / Body / Footer subcomponents', () => {
    render(
      <Card variant="elevated" padding="lg">
        <Card.Header>
          <h3>Title</h3>
        </Card.Header>
        <Card.Body>
          <p>Body text</p>
        </Card.Body>
        <Card.Footer>
          <button type="button">OK</button>
        </Card.Footer>
      </Card>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    const card = screen.getByText('Title').closest('.ui-card');
    expect(card).toHaveAttribute('data-variant', 'elevated');
    expect(card).toHaveAttribute('data-padding', 'lg');
  });

  it('interactive card sets data-interactive and is keyboard-focusable when caller passes tabIndex', () => {
    render(
      <Card interactive tabIndex={0} data-testid="c">
        click
      </Card>,
    );
    const card = screen.getByTestId('c');
    expect(card).toHaveAttribute('data-interactive', 'true');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('renders with custom polymorphic tag via `as` prop', () => {
    render(
      <Card as="section" data-testid="s">
        x
      </Card>,
    );
    const el = screen.getByTestId('s');
    expect(el.tagName).toBe('SECTION');
  });
});

describe('Spinner', () => {
  it('renders with role=status, aria-live, default sr label', () => {
    render(<Spinner />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('data-size', 'md');
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('honours custom label + size', () => {
    render(<Spinner size="lg" label="Generating PDF" />);
    expect(screen.getByText('Generating PDF')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'lg');
  });
});

describe('Skeleton', () => {
  it('default variant=text, single line, role=status, aria-label=Loading', () => {
    render(<Skeleton />);
    const el = screen.getByRole('status', { name: 'Loading' });
    expect(el).toHaveAttribute('data-variant', 'text');
  });

  it('variant=rect respects width + height inline', () => {
    render(<Skeleton variant="rect" width={200} height={80} data-testid="sk" />);
    const sk = screen.getByTestId('sk');
    expect(sk).toHaveAttribute('data-variant', 'rect');
    expect(sk).toHaveStyle({ width: '200px', height: '80px' });
  });

  it('variant=text with lines>1 renders a group of N skeleton lines', () => {
    const { container } = render(<Skeleton lines={3} />);
    const lines = container.querySelectorAll('.ui-skeleton');
    expect(lines.length).toBe(3);
    // Last line ends short for natural prose feel
    expect(lines[2]).toHaveStyle({ width: '60%' });
    // Group itself is the status announcement
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('variant=circle renders correct data attribute', () => {
    render(<Skeleton variant="circle" width={32} height={32} data-testid="c" />);
    expect(screen.getByTestId('c')).toHaveAttribute('data-variant', 'circle');
  });
});
