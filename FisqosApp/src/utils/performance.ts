import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

/**
 * Belirli bir süre boyunca bir değeri geciktiren hook
 * @param value Geciktirilecek değer
 * @param delay Gecikme süresi (ms)
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Belirli bir süre içinde birden fazla çağrıyı tek bir çağrıya indirgeyen hook
 * @param fn Çağrılacak fonksiyon
 * @param delay Gecikme süresi (ms)
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T => {
  const lastCall = useRef<number>(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgs = useRef<any[]>([]);

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      lastArgs.current = args;

      if (now - lastCall.current < delay) {
        if (timeout.current) {
          clearTimeout(timeout.current);
        }

        timeout.current = setTimeout(() => {
          lastCall.current = now;
          fn(...lastArgs.current);
          timeout.current = null;
        }, delay - (now - lastCall.current));
      } else {
        lastCall.current = now;
        fn(...args);
      }
    },
    [fn, delay]
  ) as T;

  return throttledFn;
};

/**
 * Animasyonlar tamamlandıktan sonra bir işlemi gerçekleştiren hook
 * @param callback Çağrılacak fonksiyon
 * @param deps Bağımlılıklar
 */
export const useAfterInteractions = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList = []
): T => {
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const afterInteractionCallback = useCallback(
    (...args: Parameters<T>) => {
      InteractionManager.runAfterInteractions(() => {
        callbackRef.current(...args);
      });
    },
    deps
  ) as T;

  return afterInteractionCallback;
};

/**
 * Bileşen monte edildikten sonra bir işlemi gerçekleştiren hook
 * @param callback Çağrılacak fonksiyon
 * @param delay Gecikme süresi (ms)
 */
export const useMount = (callback: () => void, delay = 0): void => {
  useEffect(() => {
    const timer = setTimeout(callback, delay);
    return () => clearTimeout(timer);
  }, []);
};

/**
 * Bileşen demonte edilmeden önce bir işlemi gerçekleştiren hook
 * @param callback Çağrılacak fonksiyon
 */
export const useUnmount = (callback: () => void): void => {
  useEffect(() => {
    return callback;
  }, []);
};

/**
 * Önceki değeri hatırlayan hook
 * @param value Değer
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
