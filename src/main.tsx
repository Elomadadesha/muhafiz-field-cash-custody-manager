import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
// The reference application uses a dark-first visual identity.
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.css'
import { App } from './App'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)