let pending = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn(pending));
}

export const globalLoaderStore = {
  get() {
    return pending;
  },
  subscribe(fn) {
    listeners.add(fn);
    fn(pending);
    return () => listeners.delete(fn);
  },
  inc() {
    pending += 1;
    emit();
  },
  dec() {
    pending = Math.max(0, pending - 1);
    emit();
  },
};