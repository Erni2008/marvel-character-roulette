import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useCountdown } from '../src/hooks/useCountdown';
afterEach(() => vi.useRealTimers());
it('uses monotonic time, pauses accurately, and expires only once', () => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] });
  const expire = vi.fn(),
    save = vi.fn();
  const { result, unmount } = renderHook(() => useCountdown(15, 0, expire, save));
  act(() => {
    result.current.toggle();
    expect(result.current.hasStarted()).toBe(true);
  });
  act(() => vi.advanceTimersByTime(4000));
  expect(result.current.remaining).toBe(11);
  act(() => result.current.pause());
  act(() => vi.advanceTimersByTime(10000));
  expect(result.current.remaining).toBe(11);
  expect(save).toHaveBeenCalled();
  act(() => result.current.toggle());
  act(() => vi.advanceTimersByTime(11000));
  expect(result.current.remaining).toBe(0);
  expect(expire).toHaveBeenCalledTimes(1);
  act(() => vi.advanceTimersByTime(5000));
  expect(expire).toHaveBeenCalledTimes(1);
  unmount();
});
it('pauses for navigation and saves elapsed time on unmount', () => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] });
  const save = vi.fn();
  const { result, unmount } = renderHook(() => useCountdown(30, 5000, vi.fn(), save));
  act(() => result.current.toggle());
  act(() => vi.advanceTimersByTime(2500));
  act(() => window.dispatchEvent(new Event('roulette:pause')));
  expect(result.current.running).toBe(false);
  expect(save).toHaveBeenLastCalledWith(7500);
  unmount();
});
