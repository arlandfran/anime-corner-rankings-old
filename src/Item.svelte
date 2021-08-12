<script>
  import axios from "axios";
  import { afterUpdate } from "svelte";
  import { checkCache, cacheData } from "./cache";

  export let rank;
  export let title;
  export let votes;
  export let isActive;

  let src;

  afterUpdate(async () => {
    src = await fetchBannerImg();
  });

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

  const fetchBannerImg = async () => {
    let data;
    const key = `${title} Banner`;
    let cache = checkCache(key);

    if (cache.cachedData && !cache.expired) {
      return cache.cachedData.data;
    } else {
      const query = `
  query ($title: String){
    Media (search: $title, type: ANIME) {
      bannerImage
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
        .then((result) => {
          data = result.data.data.Media.bannerImage;

          if (data === null) {
            data =
              "https://raw.githubusercontent.com/arlandfran/anime-corner-rankings/main/assets/img/404-banner.jpg";
          }
        })
        .catch((err) => {
          data =
            "https://raw.githubusercontent.com/arlandfran/anime-corner-rankings/main/assets/img/404-banner.jpg";
          console.log(err.message);
        });

      cacheData(key, data);
    }

    return data;
  };
</script>

<div class="card" on:click={toggleActive}>
  <div class="card--rank">
    {rank}
  </div>
  <div
    class="card--title--img"
    style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url({src});"
  >
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
    align-items: center;
    height: 6rem;
    background-color: var(--primary-color);
    border-radius: 4px;
    cursor: pointer;
  }

  .card--rank {
    width: 4rem;
    font-size: x-large;
    font-weight: bold;
    text-align: center;
  }

  .card--title--img {
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 100%;
    color: #fff;
    padding-left: 0.5rem;
    font-size: 1rem;
    font-weight: bold;
    text-transform: uppercase;
    text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.6);
    background-size: cover;
    background-position: center;
  }

  .card--votes {
    width: 6rem;
    text-align: center;
  }
</style>
