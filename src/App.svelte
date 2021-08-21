<script>
  import Leaderboard from "./components/Leaderboard.svelte";
  import Footer from "./components/Footer.svelte";

  let showOnPx = 200;
  let hidden = true;

  function goTop() {
    document.body.scrollIntoView();
  }

  function scrollContainer() {
    return document.documentElement || document.body;
  }

  function handleOnScroll() {
    if (!scrollContainer()) {
      return;
    }

    if (scrollContainer().scrollTop > showOnPx) {
      hidden = false;
    } else {
      hidden = true;
    }
  }
</script>

<svelte:window on:scroll={handleOnScroll} />

<main>
  <h1>
    <a href="https://animecorner.me/" target="_blank">animecorner.me rankings</a
    >
  </h1>
  <p>A web representation of anime corner's anime of the week.</p>
  <Leaderboard />
</main>

<button on:click={goTop} class:hidden
  ><svg
    id="arrow"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    ><path
      d="M0 16.67l2.829 2.83 9.175-9.339 9.167 9.339 2.829-2.83-11.996-12.17z"
    /></svg
  ></button
>

<Footer />

<style>
  main {
    text-align: center;
    min-width: 288px;
    max-width: 1024px;
    margin: 0 auto;
  }

  h1 {
    margin-block-end: 0;
    font-size: 2em;
    font-weight: bold;
  }

  a {
    color: white;
    text-decoration-color: var(--primary-color);
  }
  a:hover,
  a:focus {
    color: var(--primary-color);
  }

  button {
    padding: 0.5rem 1rem;
    position: fixed;
    z-index: 1;
    right: 2rem;
    user-select: none;
    bottom: 1rem;
    fill: white;
    background-color: var(--primary-color);
    opacity: 1;
    transition: opacity 0.3s, visibility 0.3s;
  }

  button.hidden {
    opacity: 0;
    visibility: hidden;
  }
</style>
