<script>
  import axios from "axios";
  import ItemRank from "./ItemRank.svelte";
  import ItemBanner from "./ItemBanner.svelte";
  import ItemDetails from "./ItemDetails.svelte";
  import { checkCache, cacheData } from "../cache";

  export let rank;
  export let title;
  export let votes;
  export let banner;
  export let previousRank;
  export let previousVotes;
  export let isActive;

  function toggleActive() {
    isActive = !isActive;
  }

  const fetchDetails = async () => {
    let data;
    let key = `${title} Details`;
    let cache = checkCache(key);

    // If cached data exists and is not expired then return data
    if (cache.cachedData && !cache.expired) {
      return cache.cachedData.data;
    } else {
      // Otherwise fetch data from Anilist
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

      await axios({
        method: "post",
        url: "https://graphql.anilist.co/",
        headers,
        data: JSON.stringify({
          query: query,
          variables: variables,
        }),
      })
        .then((result) => (data = result.data.data.Media))
        // if HTTP status = 404, fetch data from Kitsu
        .catch(async (err) => {
          console.log(err.message);
          console.log("Trying Kitsu...");

          const headers = {
            "Content-Type": "application/vnd.api+json",
            Accept: "application/vnd.api+json",
          };

          const fetchAnimeKitsu = async () => {
            const result = {};
            const response = await axios({
              method: "get",
              url: `https://kitsu.io/api/edge/anime?filter[text]=${title}`,
              headers,
            }).catch((err) => console.log(err.message));

            result.description =
              response.data.data[0].attributes.synopsis.replace(
                // Replace \n with <br />
                /\n/g,
                "<br />"
              );

            return result;
          };

          data = await fetchAnimeKitsu();
        });
      // Save data in local storage
      cacheData(key, data);

      console.log(`${title} details fetched`, data);
      return data;
    }
  };
</script>

<div class="card" on:click={toggleActive}>
  <ItemRank {rank} />
  <ItemBanner {banner} {title} />
  <ItemDetails {rank} {previousRank} {votes} {previousVotes} />
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
    align-items: center;
    height: 6rem;
    background-color: var(--primary-color);
    border-radius: 4px;
    cursor: pointer;
  }
</style>
