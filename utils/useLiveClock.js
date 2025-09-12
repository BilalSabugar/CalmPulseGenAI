import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

export function useLiveClock({
  withSeconds = false,
  locale,      // e.g. 'en-GB' | undefined to use device
  timeZone,    // e.g. 'Asia/Kolkata' | undefined to use device
  hour12,      // true/false | undefined to use device default
} = {}) {
  const [now, setNow] = useState(() => new Date());
  const appState = useRef('active');
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  };

  const startTimers = () => {
    clearTimers();
    // If showing seconds, just update every second
    if (withSeconds) {
      intervalRef.current = setInterval(() => setNow(new Date()), 1000);
      return;
    }
    // Otherwise align to the next minute, then tick each minute
    const n = new Date();
    const delay = 60000 - (n.getSeconds() * 1000 + n.getMilliseconds());
    timeoutRef.current = setTimeout(function tickToMinute() {
      setNow(new Date());
      intervalRef.current = setInterval(() => setNow(new Date()), 60000);
    }, delay);
  };

  useEffect(() => {
    // start initially
    startTimers();

    // pause/resume with app state (saves battery on mobile)
    const sub = AppState.addEventListener('change', (s) => {
      appState.current = s;
      if (s === 'active') {
        setNow(new Date());
        startTimers();
      } else {
        clearTimers();
      }
    });

    return () => {
      clearTimers();
      sub?.remove?.();
    };
    // re-run if these options change
  }, [withSeconds, timeZone, locale, hour12]);

  // Formatters — prefer Intl where available, fallback to toLocale*
  const timeStr = useMemo(() => {
    try {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const fmt = new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit',
          ...(withSeconds ? { second: '2-digit' } : null),
          ...(hour12 !== undefined ? { hour12 } : null),
          ...(timeZone ? { timeZone } : null),
        });
        return fmt.format(now);
      }
    } catch {}
    return now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      ...(withSeconds ? { second: '2-digit' } : null),
    });
  }, [now, locale, timeZone, withSeconds, hour12]);

  const dateStr = useMemo(() => {
    try {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        const fmt = new Intl.DateTimeFormat(locale, {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          ...(timeZone ? { timeZone } : null),
        });
        return fmt.format(now);
      }
    } catch {}
    return now.toLocaleDateString([], {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [now, locale, timeZone]);

  return { now, timeStr, dateStr };
}
