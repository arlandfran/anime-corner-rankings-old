<script>
  import { cf } from "./firebase";
  import axios from "axios";

  export let rank;
  export let title;
  export let votes;
  export let isActive;

  function toggleActive() {
    isActive = !isActive;
  }

  const fetchDetails = async () => {
    let data;

    // Set cache lifetime in seconds
    let cacheLife = 86400; // 24 hours
    // Get cached data from local storage
    let cachedData = localStorage.getItem(`${title} Details`);

    // If cached data exists then parse the data and check if data is expired
    if (cachedData) {
      cachedData = JSON.parse(cachedData);
      var expired =
        parseInt(Date.now() / 1000) - cachedData.cachetime > cacheLife;
      console.log("Cached Data expired:", expired);
    }

    // If cached data exists and is not expired then return data
    if (cachedData && !expired) {
      return cachedData.data;
    } else {
      // Otherwise fetch data
      const query = `
  query ($title: String){
    Media (search: $title, type: ANIME) {
      rankings {
        allTime
        rank
        context
      }
      genres
      description
      externalLinks {
        url
      }
      coverImage {
        extraLarge
      }
    }
  } 
  `;

      const variables = {
        title: title,
      };

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const result = await axios({
        method: "post",
        url: "https://graphql.anilist.co/",
        headers,
        data: JSON.stringify({
          query: query,
          variables: variables,
        }),
      }).catch((err) => console.log(err.message));

      data = result.data.data.Media;

      // Save data in local storage
      let cacheData = { data: data, cachetime: parseInt(Date.now() / 1000) };
      localStorage.setItem(`${title} Details`, JSON.stringify(cacheData));

      console.log(`${title} details fetched`, data);
      return data;
    }
  };
</script>

<div class="card" on:click={toggleActive}>
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

<style>
  .card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    height: 4rem;
    padding-left: 1rem;
    padding-right: 1rem;
    background-color: var(--primary-color);
    border-radius: 4px;
    cursor: pointer;
  }
</style>
