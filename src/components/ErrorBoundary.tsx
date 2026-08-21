import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '@/lib/errorReporter';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, { source: 'react.error-boundary', details: { componentStack: info.componentStack } });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main dir="rtl" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'Tajawal, sans-serif' }}>
        <section style={{ maxWidth: 440, textAlign: 'center' }}>
          <h1>حدث خطأ غير متوقع</h1>
          <p>يمكنك إعادة تحميل الصفحة للمتابعة. بيانات العُهَد المحلية لا يتم حذفها بسبب هذا الخطأ.</p>
          <button type="button" onClick={() => window.location.reload()} style={{ padding: '12px 20px', cursor: 'pointer' }}>
            إعادة تحميل التطبيق
          </button>
        </section>
      </main>
    );
  }
}
