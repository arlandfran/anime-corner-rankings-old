import { writable } from "svelte/store";

export const year = writable("2021");
export const season = writable("Summer");
export const week = writable("Week-06");
export const page = writable(1);
export const isActive = writable(false);

export function modalState(initialState) {
  const isOpen = writable(initialState);
  const { set, update } = isOpen;

  return {
    isOpen,
    open: () => set(true),
    close: () => set(false),
    toggle: () => update((n) => !n),
  };
}
