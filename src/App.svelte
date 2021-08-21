<script>
  import Leaderboard from "./components/Leaderboard.svelte";
  import Footer from "./components/Footer.svelte";
</script>

<main>
  <h1>
    <a href="https://animecorner.me/" target="_blank">animecorner.me rankings</a
    >
  </h1>
  <p>A web representation of anime corner's anime of the week.</p>
  <Leaderboard />
</main>

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
</style>
