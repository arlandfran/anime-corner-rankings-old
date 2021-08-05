<script>
  import { cf } from "./firebase";

  export let rank;
  export let title;
  export let votes;
  export let isActive;

  function toggleActive() {
    isActive = !isActive;
  }

  const fetchDetails = async () => {
    let data;
    const fetchAnime = cf.httpsCallable("fetchAnime");
    await fetchAnime({ title: title }).then((result) => {
      data = result.data;
      console.log("Anime details fetched", data);
    });
    return data;
  };
</script>

<div class="card" on:click={toggleActive}>
  <div class="card--header">
    <div class="card--rank">
      {rank}
    </div>
    <div class="card--title">
      {title}
    </div>
    <div class="card--votes">
      {votes}%
    </div>
  </div>
  {#if isActive}
    {#await fetchDetails()}
      <div class="card-content">
        <p>Loading...</p>
      </div>
    {:then anime}
      <div class="card-content">
        {@html anime.description}
      </div>
    {/await}
  {/if}
</div>

<style>
  .card--header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    height: 4rem;
    padding-left: 1rem;
    padding-right: 1rem;
    background-color: var(--primary-color);
    border-radius: 4px;
  }
</style>
