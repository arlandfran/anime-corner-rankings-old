<script>
  import Leaderboard from "./components/Leaderboard.svelte";
</script>

<main>
  <h1>Anime Corner Rankings</h1>
  <Leaderboard />
</main>

<style>
  main {
    text-align: center;
    min-width: 288px;
    max-width: 1024px;
    margin: 0 auto;
  }

  h1 {
    color: var(--primary-color);
    text-transform: uppercase;
    font-size: 2em;
    font-weight: bold;
  }
</style>
