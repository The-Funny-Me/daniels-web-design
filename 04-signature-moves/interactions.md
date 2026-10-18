# Signature Micro-Interactions & Physics Code Patterns

Executable patterns and implementation guidelines for core interaction physics, cursor dynamics, and form mechanics.

---

## 1. Navigation & Cursor Dynamics Code Patterns

### 1.1 Safe Triangle Submenu Aiming Math
```typescript
// Math helper for dynamic submenu safety triangle checking
interface Point { x: number; y: number; }

export function isPointInTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
  const denominator = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
  const alpha = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / denominator;
  const beta = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / denominator;
  const gamma = 1 - alpha - beta;
  return alpha >= 0 && beta >= 0 && gamma >= 0;
}
```

### 1.2 Hover Intent Delay Hook
```typescript
import { useRef, useEffect } from 'react';

export function useHoverIntent(onIntent: () => void, delay = 150) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      onIntent();
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { handleMouseEnter, handleMouseLeave };
}
```

---

## 2. Form & Search Physics Code Patterns

### 2.1 Debounced Search Query with Cache Fallback
```typescript
import { useState, useEffect, useRef } from 'react';

export function useDebouncedSearch<T>(query: string, fetchFn: (q: string) => Promise<T[]>, delay = 250) {
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Record<string, T[]>>({});

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    // Instant local cache lookup on backspace / repeated query
    if (cacheRef.current[trimmed]) {
      setResults(cacheRef.current[trimmed]);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await fetchFn(trimmed);
        cacheRef.current[trimmed] = data;
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [query, fetchFn, delay]);

  return { results, loading };
}
```

### 2.2 Dimension-Locked Loading Button Pattern
```tsx
import React, { useRef, useLayoutEffect, useState } from 'react';

export function DimensionLockedButton({ loading, children, className, ...props }: any) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dimensions, setDimensions] = useState<{ width?: number; height?: number }>({});

  useLayoutEffect(() => {
    if (btnRef.current && !loading) {
      const rect = btnRef.current.getBoundingClientRect();
      if (rect.width > 0) {
        setDimensions({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    }
  }, [children, loading]);

  return (
    <button
      ref={btnRef}
      style={{
        minWidth: dimensions.width ? `${dimensions.width}px` : undefined,
        minHeight: dimensions.height ? `${dimensions.height}px` : undefined,
      }}
      className={`relative inline-flex items-center justify-center rounded-pill px-6 py-3 font-medium transition-colors ${className}`}
      disabled={loading}
      {...props}
    >
      <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="h-5 w-5 animate-spin text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      )}
    </button>
  );
}
```

---

## 3. State & Focus Physics Code Patterns

### 3.1 Optimistic Toggle with Rollback Toast
```typescript
import { useState } from 'react';

export function useOptimisticToggle(
  initialState: boolean,
  apiMutate: (nextState: boolean) => Promise<void>,
  onErrorRollback: (err: any) => void
) {
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    const previous = state;
    const next = !previous;
    
    // 1. Optimistic Update
    setState(next);
    setPending(true);

    try {
      // 2. Background Sync
      await apiMutate(next);
    } catch (error) {
      // 3. Graceful Rollback on failure
      setState(previous);
      onErrorRollback(error);
    } finally {
      setPending(false);
    }
  };

  return { state, toggle, pending };
}
```

### 3.2 Modal Focus Trap & Focus Restoration Hook
```typescript
import { useEffect, useRef } from 'react';

export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const focusables = containerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables && focusables.length > 0) {
        focusables[0].focus();
      }
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  return containerRef;
}
```
