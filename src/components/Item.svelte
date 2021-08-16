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
      description
      genres
      externalLinks {
        site
        url
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

          const fetchAnimeKitsu = async () => {
            const data = {};

            const query = `
            query($title: String!) {
  searchAnimeByTitle(first: 1, title: $title) {
    nodes {
      description
      categories(first: 10) {
        nodes {
          slug
        }
      }
      streamingLinks(first: 5) {
        nodes {
          streamer {
            siteName
          }
          url
        }
      }
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
              url: "https://kitsu.io/api/graphql",
              headers,
              data: JSON.stringify({
                query: query,
                variables: variables,
              }),
            })
              .then((result) => {
                console.log(result);
                data.description =
                  result.data.data.searchAnimeByTitle.nodes[0].description.en;
                let genres = [];
                let categories =
                  result.data.data.searchAnimeByTitle.nodes[0].categories.nodes;
                for (let i = 0; i < categories.length; i++) {
                  genres.push(categories[i].slug);
                }
                data.genres = genres;
                let streams =
                  result.data.data.searchAnimeByTitle.nodes[0].streamingLinks
                    .nodes;
                let links = [];
                for (let i = 0; i < streams.length; i++) {
                  if (
                    streams[i].streamer.siteName == "Crunchyroll" ||
                    streams[i].streamer.siteName == "Funimation"
                  ) {
                    links.push({
                      site: streams[i].streamer.siteName,
                      url: streams[i].url,
                    });
                  }
                }
                data.externalLinks = links;
              })
              .catch((err) => console.log(err.message));

            return data;
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
    border-radius: 6px;
    cursor: pointer;
  }
</style>
