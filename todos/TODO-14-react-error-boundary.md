# TODO-14 — Add React Error Boundary to Frontend

- **Priority:** 🟡 Medium
- **Status:** [ ] Not Started
- **File:** `client/src/App.tsx`
- **New File:** `client/src/components/ErrorBoundary.tsx`

---

## Problem

There is no error boundary wrapping the route components.
Any unhandled JavaScript error in a page component (Scanner, Alerts, Tips, Index)
will crash the entire app and show a blank white screen with no user feedback.

---

## Steps to Fix

- [ ] Create `client/src/components/ErrorBoundary.tsx`
- [ ] Wrap the `<Routes>` block in `App.tsx` with `<ErrorBoundary>`
- [ ] Style the fallback UI to match the cyber dark theme

---

## Code to Write

**`client/src/components/ErrorBoundary.tsx`:**
```tsx
import { Component, ReactNode } from 'react';

interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-cyber-dark text-cyber-text p-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{this.state.message}</p>
          <button
            className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**`client/src/App.tsx`** — wrap routes:
```tsx
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Inside App():
<ErrorBoundary>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/scanner" element={<Scanner />} />
    <Route path="/alerts" element={<Alerts />} />
    <Route path="/tips" element={<Tips />} />
  </Routes>
</ErrorBoundary>
```

---

## Done When

- [ ] `ErrorBoundary.tsx` exists in `client/src/components/`
- [ ] Throwing an error inside any page component shows the fallback UI, not a blank screen
- [ ] "Try Again" button resets the error state
- [ ] Fallback UI matches the dark cyber theme
