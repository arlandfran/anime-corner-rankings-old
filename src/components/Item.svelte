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
      stripLinks(data);
      // Save data in local storage
      cacheData(key, data);

      console.log(`${title} details fetched`, data);
      return data;
    }
  };

  function stripLinks(data) {
    let links = [];
    for (let i = 0; i < data.externalLinks.length; i++) {
      if (
        data.externalLinks[i].site == "Crunchyroll" ||
        data.externalLinks[i].site == "Funimation"
      ) {
        links.push({
          site: data.externalLinks[i].site,
          url: data.externalLinks[i].url,
        });
      }
    }
    data.externalLinks = links;
  }
</script>

<div class="wrapper" on:click={toggleActive}>
  <div class="card" class:straight-bottom-border={isActive}>
    <ItemRank {rank} />
    <ItemBanner {banner} {title} />
    <ItemDetails {rank} {previousRank} {votes} {previousVotes} {isActive} />
  </div>
  {#if isActive}
    {#await fetchDetails()}
      <div class="card-content">
        <p>Loading...</p>
      </div>
    {:then anime}
      <div class="card-content">
        <div class="pills">
          {#each anime.genres as genres}
            <div class="pill">{genres}</div>
          {/each}
        </div>
        <div class="links">
          Watch on:
          {#each anime.externalLinks as link}
            {#if link.site == "Crunchyroll"}
              <a href={link.url} class="crunchy-pill">
                <img src="logos/Crunchyroll.svg" alt="" class="crunchyroll" />
              </a>
            {:else if link.site == "Funimation"}
              <a href={link.url} class="fun-pill">
                <img
                  src="logos/Funimation.svg"
                  alt=""
                  class="site funimation"
                />
              </a>
            {/if}
          {/each}
        </div>
        {@html anime.description}
      </div>
    {/await}
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
