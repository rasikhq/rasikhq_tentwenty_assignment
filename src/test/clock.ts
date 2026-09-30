// Everything but the date stays real, so waitFor, timers and the network keep running. The date still
// ticks on with real time, which the persister's write throttle relies on.
const realTimers = [
  'hrtime',
  'nextTick',
  'performance',
  'queueMicrotask',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'requestIdleCallback',
  'cancelIdleCallback',
  'setImmediate',
  'clearImmediate',
  'setInterval',
  'clearInterval',
  'setTimeout',
  'clearTimeout',
] as const;

/** Lets a test move the date forward. Every test starts on the real clock. */
export function controlDate() {
  jest.useFakeTimers({ doNotFake: [...realTimers], advanceTimers: true });
}

/** Moves the date forward by this many hours. */
export function passHours(hours: number) {
  jest.setSystemTime(Date.now() + hours * 60 * 60 * 1000);
}
