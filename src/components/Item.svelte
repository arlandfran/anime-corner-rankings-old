<script>
  import ItemRank from "./ItemRank.svelte";
  import ItemBanner from "./ItemBanner.svelte";
  import ItemDetails from "./ItemDetails.svelte";

  export let rank;
  export let title;
  export let votes;
  export let banner;
  export let previousRank;
  export let previousVotes;
  export let description;
  export let genres;
  export let externalLinks;
  export let isActive;

  function toggleActive() {
    isActive = !isActive;
  }
</script>

<div class="wrapper" on:click={toggleActive}>
  <div class="card" class:straight-bottom-border={isActive}>
    <ItemRank {rank} />
    <ItemBanner {banner} {title} />
    <ItemDetails {rank} {previousRank} {votes} {previousVotes} {isActive} />
  </div>
  {#if isActive}
    <div class="card-content">
      <div class="pills">
        {#each genres as genres}
          <div class="pill">{genres}</div>
        {/each}
      </div>
      <div class="links">
        Watch on:
        {#each externalLinks as link}
          {#if link.site == "Crunchyroll"}
            <a href={link.url} class="crunchy-pill">
              <img src="logos/Crunchyroll.svg" alt="" class="crunchyroll" />
            </a>
          {:else if link.site == "Funimation"}
            <a href={link.url} class="fun-pill">
              <img src="logos/Funimation.svg" alt="" class="site funimation" />
            </a>
          {/if}
        {/each}
      </div>
      {@html description}
    </div>
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
  }
  .card {
    display: flex;
    align-items: center;
    height: 6rem;
    background-color: var(--primary-color);
    border-radius: 6px;
    cursor: pointer;
  }

  .straight-bottom-border {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .card-content {
    padding: 1rem;
    background-color: #383838;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .pill {
    padding: 0.5rem;
    background-color: var(--primary-color);
    border-radius: 12px;
  }

  .links {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    font-weight: bold;
  }

  .site {
    height: 1.1rem;
  }

  .crunchyroll {
    height: 1.6rem;
  }

  .crunchy-pill {
    display: flex;
    align-items: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
    border-radius: 6px;
    background-color: #f47521;
  }

  .funimation {
    height: 1rem;
  }

  .fun-pill {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 6px;
    background-color: #472d8e;
  }
</style>
