import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
export function useAutoLock() {
  const lockApp = useAppStore(s => s.lockApp);
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  const isLocked = useAppStore(s => s.isLocked);
  const settings = useAppStore(s => s.settings);
  const timerRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const checkForInactivity = useCallback(() => {
    if (!isAuthenticated || isLocked || settings.autoLockMinutes === 0) return;
    const now = Date.now();
    const elapsed = now - lastActivityRef.current;
    const limit = settings.autoLockMinutes * 60 * 1000;
    if (elapsed >= limit) {
      lockApp();
    }
  }, [isAuthenticated, isLocked, settings.autoLockMinutes, lockApp]);
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);
  useEffect(() => {
    // Events to track activity
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => {
      updateActivity();
    };
    // Attach listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    // Check interval
    const intervalId = setInterval(checkForInactivity, 10000); // Check every 10s
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
    };
  }, [checkForInactivity, updateActivity]);
  return null;
}