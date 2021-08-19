import { writable } from "svelte/store";

export const year = writable("2021");
export const season = writable("Summer");
export const week = writable("Week-06");
export const page = writable(1);
export const isActive = writable(false);

export function modalState(initialState) {
  const isOpen = writable(initialState);
  const { set } = isOpen;

  return {
    isOpen,
    open: () => set(true),
    close: () => set(false),
  };
}

export function nextButtonState(initialState) {
  const next = writable(initialState);
  const { set } = next;

  return {
    next,
    enableNext: () => {
      document.getElementById("next-btn").disabled = false;
      set(false);
    },
    disableNext: () => {
      document.getElementById("next-btn").disabled = true;
      set(true);
    },
  };
}

export function prevButtonState(initialState) {
  const prev = writable(initialState);
  const { set } = prev;

  return {
    prev,
    enablePrev: () => {
      document.getElementById("prev-btn").disabled = false;
      set(false);
    },
    disablePrev: () => {
      document.getElementById("prev-btn").disabled = true;
      set(true);
    },
  };
}
