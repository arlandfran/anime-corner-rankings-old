import { writable } from "svelte/store";
import watchMedia from "svelte-media";

const mediaqueries = {
  mobile: "(max-width: 1440px)",
  desktop: "(min-width: 1440px)",
  noanimations: "(prefers-reduced-motion: reduce)",
};

export const media = watchMedia(mediaqueries);
export const year = writable("2021");
export const season = writable("Summer");
export const week = writable("Week-07");
export const page = writable(1);
export const isActive = writable(false);
export const faq = writable([
  {
    question: "What is Anime Corner Rankings?",
    answer:
      "This site tracks the weekly rankings released by Anime Corner, an online community that provides news, highlights and articles on the anime industry. In particular the site displays their list in an interactive leaderboard that can expand to show you more information about a show if it catches your interest.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "The poll data is collected by Anime Corner and published on their <a href='https://animecorner.me/category/anime-corner/rankings/anime-of-the-week/' target='_blank'>website</a>. If you're curious about how the data is collected and calculated you can learn more about it <a href='https://animecorner.me/polls/' target='_blank'>here</a>.<br /><br />Data about each anime is provided by <a href='https://anilist.co/' target='_blank'>Anilist</a> & <a href='https://kitsu.io/' target='_blank'>Kitsu</a>.",
  },
  {
    question: "How often are the rankings updated?",
    answer:
      "The rankings are updated every Friday at approximately 13:00pm UTC.",
  },
  {
    question: "How can I vote?",
    answer:
      "You can cast your vote over at <a href='https://animecorner.me/polls/' target='_blank'>polls.animecorner.me</a>",
  },
  {
    question: "Are there similar rankings out there?",
    answer:
      "Yes this site was actually inspired by some of these sites here:<br /><ul><li><a href='https://animekarmalist.com/' target='_blank'>animekarmalist.com</a></li><li><a href='https://animekarmawatch.com/' target='_blank'>animekarmawatch.com</a></li><li><a href='https://animetrics.co/' target='_blank'>animetrics.co</a></li><li><a href='https://anitrendz.net/' target='_blank'>anitrendz.net</a></li></ul>",
  },
  {
    question: "How can I contact you?",
    answer:
      "If you have any have questions, feedback or suggestions about the site, please feel free and create an issue on the project repository or even better make a PR yourself!",
  },
]);

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

export function showMoreButtonState(initialState) {
  const loading = writable(initialState);
  const { set } = loading;

  return {
    loading,
    fetching: () => set(true),
    fetched: () => set(false),
  };
}
