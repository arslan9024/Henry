import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEY_DENSITY } from '../constants/storageKeys';

const VALUES = ['comfortable', 'compact'];

const read = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY_DENSITY);
    if (VALUES.includes(v)) return v;
  } catch {
    /* ignore */
  }
  return 'comfortable';
};

const apply = (value) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.density = value;
};

/**
 * useDensity — global compact/comfortable spacing toggle. Persists to
 * localStorage and applies `data-density` to <html> so CSS can override
 * the spacing/font-size token scale.
 */
export default function useDensity() {
  const [density, setDensity] = useState(read);

  useEffect(() => {
    apply(density);
    try {
      localStorage.setItem(STORAGE_KEY_DENSITY, density);
    } catch {
      /* ignore */
    }
  }, [density]);

  const toggle = useCallback(() => {
    setDensity((d) => (d === 'compact' ? 'comfortable' : 'compact'));
  }, []);

  return { density, toggle };
}
