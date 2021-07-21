<script>
  import Leaderboard from "./Leaderboard.svelte";
</script>

<main>
  <h1>Anime Corner Rankings</h1>
  <Leaderboard />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 2em;
    font-weight: bold;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
