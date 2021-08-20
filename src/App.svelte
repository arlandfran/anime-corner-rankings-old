<script>
  import Leaderboard from "./components/Leaderboard.svelte";
  import Footer from "./components/Footer.svelte";
</script>

<main>
  <h1>Anime Corner Rankings</h1>
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
    text-transform: uppercase;
    font-size: 2em;
    font-weight: bold;
    text-decoration: underline;
    text-decoration-color: var(--primary-color);
  }
</style>
