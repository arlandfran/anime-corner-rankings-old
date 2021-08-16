<script>
  import axios from "axios";
  import { onMount } from "svelte";
  import { db, cf } from "../firebase";
  import Item from "./Item.svelte";
  import { year, season, week, page, isActive } from "../stores";
  import { checkCache, cacheData } from "../cache";

  let seasons = [];
  let weeks = [];
  let items = [];

  let query = db
    .collection($year)
    .doc($season)
    .collection($week)
    .orderBy("rank", "asc")
    .limit(10);

  onMount(async () => {
    items = await fetchData();
    seasons = await fetchSeasons();
    weeks = await fetchWeeks();
    // disable next btn as the latest week is always displayed on mount
    document.getElementById("next-btn").disabled = true;
  });

  const fetchData = async () => {
    document.getElementById("prev-btn").disabled = true;
    document.getElementById("next-btn").disabled = true;
    let key = `${$season}-${$week}-page-${$page}`;
    let cache = checkCache(key);

    // If cached data exists and is not expired then return data
    if (cache.cachedData && !cache.expired) {
      document.getElementById("prev-btn").disabled = false;
      document.getElementById("next-btn").disabled = false;
      return cache.cachedData.data;
    } else {
      // Otherwise fetch data
      let data = await query
        .get()
        // Converts firestore collection into array of documents
        .then((snapshots) => snapshots.docs.map((doc) => doc.data()));

      // fetch banners and append banner property to data object
      await fetchBanners(data);
      await fetchPreviousStandings(data);

      // Save data in local storage
      cacheData(key, data);

      console.log("Data fetched:", data);

      document.getElementById("prev-btn").disabled = false;
      document.getElementById("next-btn").disabled = false;

      return data;
    }
  };

  const fetchNextData = async () => {
    $page += 1;
    let item;
    let key = `${$season}-${$week}-page-${$page}`;
    let cache = checkCache(key);

    if (cache.cachedData && !cache.expired) {
      // Update items array with cached documents
      let data = cache.cachedData.data;
      for (let i = 0; i < data.length; i++) {
        item = {
          rank: data[i].rank,
          title: data[i].title,
          votes: data[i].votes,
          banner: data[i].banner,
          previousRank: data[i].previousRank,
          previousVotes: data[i].previousVotes,
        };
        items = [...items, item];
      }
    } else {
      await query.get().then((snapshots) => {
        // Get the last visible document
        let lastVisible = snapshots.docs[snapshots.docs.length - 1];

        query = db
          .collection($year)
          .doc($season)
          .collection($week)
          .orderBy("rank", "asc")
          .startAfter(lastVisible)
          .limit(10);

        query.get().then(async (snapshots) => {
          // Converts newly fetched collection into array of documents
          let data = snapshots.docs.map((doc) => doc.data());

          await fetchBanners(data);
          await fetchPreviousStandings(data);

          // Update items array with new documents
          for (let i = 0; i < data.length; i++) {
            item = {
              rank: data[i].rank,
              title: data[i].title,
              votes: data[i].votes,
              banner: data[i].banner,
              previousRank: data[i].previousRank,
              previousVotes: data[i].previousVotes,
            };
            items = [...items, item];
          }

          cacheData(key, data);

          // Disable show more button if there is no more data to be fetched
          if (snapshots.size < 10) {
            document.getElementById("showMore").disabled = true;
            console.log("No more data to be fetched");
          } else {
            console.log("Next batch of data fetched");
          }
        });
      });
    }
  };

  const fetchSeasons = async () => {
    let key = "Seasons";
    let cache = checkCache(key);

    if (cache.cachedData && !cache.expired) {
      return cache.cachedData.data;
    } else {
      let seasonQuery = db.collection($year).orderBy("order", "asc");

      await seasonQuery.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          seasons = [...seasons, doc.id];
        });
      });

      cacheData(key, seasons);

      console.log("Seasons fetched:", seasons);
      return seasons;
    }
  };

  const fetchWeeks = async () => {
    let key = `${$season}-Weeks`;
    let cache = checkCache(key);

    if (cache.cachedData && !cache.expired) {
      weeks.length = 0;
      weeks = cache.cachedData.data;
      return weeks;
    } else {
      weeks.length = 0;
      const fetchSubCollections = cf.httpsCallable("fetchSubCollections");
      await fetchSubCollections({ year: $year, season: $season }).then(
        (result) => {
          weeks = result.data;
        }
      );

      cacheData(key, weeks);

      console.log("Weeks fetched:", weeks);
      return weeks;
    }
  };

  const updateSeason = async () => {
    // When changing the season param, reset the week param and btn states
    $week = "Week-01";
    document.getElementById("prev-btn").disabled = true;
    document.getElementById("next-btn").disabled = false;

    await updateItems();
    await fetchWeeks();
  };

  const updateItems = async () => {
    document.getElementById("prev-btn").disabled = true;
    document.getElementById("next-btn").disabled = true;

    let key = `${$season}-${$week}-page-${$page}`;
    let cache = checkCache(key);

    // If cached data exists and is not expired then return data
    if (cache.cachedData && !cache.expired) {
      items.length = 0; // Clear items array
      items = cache.cachedData.data;
    } else {
      let item = [];
      items.length = 0; // Clear items array

      // Fetch a new query with updated parameters
      query = db
        .collection($year)
        .doc($season)
        .collection($week)
        .orderBy("rank", "asc")
        .limit(10);

      let data = await query
        .get()
        .then((snapshots) => snapshots.docs.map((doc) => doc.data()));

      await fetchBanners(data);
      await fetchPreviousStandings(data);

      for (let i = 0; i < data.length; i++) {
        item = {
          rank: data[i].rank,
          title: data[i].title,
          votes: data[i].votes,
          banner: data[i].banner,
          previousRank: data[i].previousRank,
          previousVotes: data[i].previousVotes,
        };
        items = [...items, item];
      }
      // Save data in local storage
      cacheData(key, data);
      console.log("Items array updated. New Items:", items);
    }

    document.getElementById("next-btn").disabled = false;
    if ($week == "Week-01") {
      document.getElementById("prev-btn").disabled = true;
    } else {
      document.getElementById("prev-btn").disabled = false;
    }

    // Re-enable button in the case that the user has fetched the entire subcollection and button was disabled
    document.getElementById("showMore").disabled = false;
  };

  const fetchBanners = async (data) => {
    let title;

    for (let i = 0; i < data.length; i++) {
      let banner;
      title = data[i].title;

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
        .then(async (result) => {
          banner = result.data.data.Media.bannerImage;

          if (banner === null) {
            banner = await fetchKitsuBanner(title);
          }
        })
        .catch(async (err) => {
          console.log(err.message);
          banner = await fetchKitsuBanner(title);
        });
      data[i].banner = banner;
    }
  };

  const fetchKitsuBanner = async (title) => {
    let banner;

    const query = `
  query ($title: String!){
    searchAnimeByTitle (first: 1, title: $title) {
      nodes {
        bannerImage {
          original {
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
      .then(async (result) => {
        if (
          result.data.data.searchAnimeByTitle.nodes[0].bannerImage.original
            .url == "/cover_images/original/missing.png"
        ) {
          banner =
            "https://raw.githubusercontent.com/arlandfran/anime-corner-rankings/main/assets/img/404-banner.jpg";
        } else {
          banner =
            result.data.data.searchAnimeByTitle.nodes[0].bannerImage.original
              .url;
        }
      })
      .catch((err) => {
        banner =
          "https://raw.githubusercontent.com/arlandfran/anime-corner-rankings/main/assets/img/404-banner.jpg";
        console.log(err.message);
      });
    return banner;
  };

  const fetchPreviousStandings = async (data) => {
    let previousWeek;
    let query;
    let n = parseInt($week.split("-")[1]);
    n -= 1;
    if (n > 10) {
      previousWeek = "Week-" + n.toString();
    } else {
      previousWeek = "Week-0" + n.toString();
    }

    query = db.collection($year).doc($season).collection(previousWeek);

    if (previousWeek == "Week-00") {
      for (let i = 0; i < data.length; i++) {
        data[i].previousRank = null;
        data[i].previousVotes = null;
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        let previousData = await query
          .where("title", "==", data[i].title)
          .get()
          .then((snapshots) => snapshots.docs.map((doc) => doc.data()));

        if (previousData[0] == undefined) {
          data[i].previousRank = null;
          data[i].previousVotes = null;
        } else {
          data[i].previousRank = previousData[0].rank;
          data[i].previousVotes = previousData[0].votes;
        }
      }
    }
  };

  function goPrev() {
    let i = weeks.indexOf($week);

    if ((document.getElementById("next-btn").disabled = true)) {
      document.getElementById("next-btn").disabled = false;
    }

    if (i == 1) {
      $week = weeks[i - 1];
      updateItems();
      document.getElementById("prev-btn").disabled = true;
    } else {
      $week = weeks[i - 1];
      updateItems();
    }
    console.log("Previous clicked");
  }

  function goNext() {
    let i = weeks.indexOf($week);

    if ((document.getElementById("prev-btn").disabled = true)) {
      document.getElementById("prev-btn").disabled = false;
    }

    if (i + 1 == weeks.length - 1) {
      $week = weeks[i + 1];
      updateItems();
      document.getElementById("next-btn").disabled = true;
    } else {
      $week = weeks[i + 1];
      updateItems();
    }
    console.log("Next clicked");
  }
</script>

<button on:click={goPrev} id="prev-btn">Previous</button>

{#if seasons == 0}
  <select>
    <option value="">Loading...</option>
  </select>
{:else}
  <!-- svelte-ignore a11y-no-onchange -->
  <select bind:value={$season} on:change={updateSeason}>
    {#each seasons as season}
      <option value={season}>{season}</option>
    {/each}
  </select>
{/if}

{#if weeks.length == 0}
  <select>
    <option value="">Loading...</option>
  </select>
{:else}
  <!-- svelte-ignore a11y-no-onchange -->
  <select bind:value={$week} on:change={updateItems}>
    {#each weeks as week}
      <option value={week}>{week.replace("-", " ")}</option>
    {/each}
  </select>
{/if}

<button on:click={goNext} id="next-btn">Next</button>

<p>The current params are {$season} {$week}</p>

<div>
  {#if items.length == 0}
    <p>Loading...</p>
  {:else}
    {#each items as item}
      <Item {...item} isActive={$isActive} />
    {/each}
  {/if}
</div>

<button on:click={fetchNextData} id="showMore">Show more rankings</button>

<style>
  div {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  button {
    margin-top: 1rem;
  }

  @media screen and (min-width: 425px) {
    div {
      padding-left: 1rem;
    }
  }
</style>
