<script>
  import ItemRank from "./ItemRank.svelte";
  import ItemBanner from "./ItemBanner.svelte";
  import ItemDetails from "./ItemDetails.svelte";
  import { Circle } from "svelte-loading-spinners";
  import { db } from "../firebase";
  import { checkCache, cacheData } from "../cache";

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

  const fetchCrunchyrollLogo = async () => {
    const key = "crunchyroll";
    const cache = checkCache(key);
    let logo;

    if (cache.cachedData && !cache.expired) {
      logo = cache.cachedData.data;
    } else {
      logo = await db
        .collection("logos")
        .doc("crunchyroll")
        .get()
        .then((doc) => {
          return doc.data().url;
        });

      cacheData(key, logo);
    }
    return logo;
  };

  const fetchFunimationLogo = async () => {
    const key = "funimation";
    const cache = checkCache(key);
    let logo;

    if (cache.cachedData && !cache.expired) {
      logo = cache.cachedData.data;
    } else {
      logo = await db
        .collection("logos")
        .doc("funimation")
        .get()
        .then((doc) => {
          return doc.data().url;
        });

      cacheData(key, logo);
    }
    return logo;
  };

  function toggleActive() {
    isActive = !isActive;
  }
</script>

<div class="wrapper">
  <div class="card" on:click={toggleActive}>
    <ItemRank {rank} />
    <ItemBanner {banner} {title} />
    <ItemDetails {rank} {previousRank} {votes} {previousVotes} {isActive} />
  </div>
  {#if isActive}
    <div class="card-content">
      <div>
        <h2 class="title">{title}</h2>
      </div>
      <div class="pills">
        {#each genres as genres}
          <div class="pill">{genres}</div>
        {/each}
      </div>
      <div class="links">
        {#if externalLinks.length == 0}
          Could not find on Crunchyroll or Funimation 😢
        {:else}
          Watch on:
          {#each externalLinks as link}
            {#if link.site == "Crunchyroll"}
              {#await fetchCrunchyrollLogo()}
                <Circle size="32" unit="px" color="#65b893" />
              {:then logo}
                <a href={link.url} class="link" target="_blank">
                  <img src={logo} alt="" class="crunchyroll" />
                </a>
              {/await}
            {:else if link.site == "Funimation"}
              {#await fetchFunimationLogo()}
                <Circle size="32" unit="px" color="#65b893" />
              {:then logo}
                <a href={link.url} class="link" target="_blank">
                  <img src={logo} alt="" class="funimation" />
                </a>
              {/await}
            {/if}
          {/each}
        {/if}
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
    background-color: var(--surface);
    cursor: pointer;
  }

  .card-content {
    padding: 1rem;
    background-color: #383838;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .title {
    margin-block-start: 0;
    margin-block-end: 0;
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
    background-color: var(--gain-color);
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

  .link {
    display: flex;
    align-items: center;
    border-radius: 6px;
  }

  .crunchyroll {
    height: 1.6rem;
    padding: 0.2rem 0.5rem;
    background-color: #f47521;
    border-radius: inherit;
  }

  .funimation {
    height: 1rem;
    padding: 0.5rem;
    background-color: #472d8e;
    border-radius: inherit;
  }
</style>
