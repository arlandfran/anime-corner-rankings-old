<script>
  import { onMount } from "svelte";
  import { db, cf } from "../firebase";
  import Item from "./Item.svelte";
  import { year, season, week, page, isActive } from "../stores";
  import { checkCache, cacheData } from "../cache";

  let seasons = [];
  let weeks = [];
  let items = [];
  let prevDisabled;
  let nextDisabled;

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
    prevDisabled = false;
    nextDisabled = true;
  });

  const fetchData = async () => {
    document.getElementById("prev-btn").disabled = true;
    document.getElementById("next-btn").disabled = true;
    prevDisabled = true;
    nextDisabled = true;

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

      // // fetch banners and append banner property to data object
      await fetchBanners(data);

      // Save data in local storage
      cacheData(key, data);

      console.log("Data fetched:", data);

      document.getElementById("prev-btn").disabled = false;
      document.getElementById("next-btn").disabled = false;
      prevDisabled = false;
      nextDisabled = false;
      console.log(prevDisabled);
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
          description: data[i].description,
          genres: data[i].genres,
          externalLinks: data[i].externalLinks,
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

          // Update items array with new documents
          for (let i = 0; i < data.length; i++) {
            item = {
              rank: data[i].rank,
              title: data[i].title,
              votes: data[i].votes,
              banner: data[i].banner,
              previousRank: data[i].previousRank,
              previousVotes: data[i].previousVotes,
              description: data[i].description,
              genres: data[i].genres,
              externalLinks: data[i].externalLinks,
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

      for (let i = 0; i < data.length; i++) {
        item = {
          rank: data[i].rank,
          title: data[i].title,
          votes: data[i].votes,
          banner: data[i].banner,
          previousRank: data[i].previousRank,
          previousVotes: data[i].previousVotes,
          description: data[i].description,
          genres: data[i].genres,
          externalLinks: data[i].externalLinks,
        };
        items = [...items, item];
      }
      // Save data in local storage
      cacheData(key, data);
      console.log("Items array updated. New Items:", items);
    }

    document.getElementById("next-btn").disabled = false;
    nextDisabled = false;
    if ($week == "Week-01") {
      document.getElementById("prev-btn").disabled = true;
      prevDisabled = true;
    } else {
      document.getElementById("prev-btn").disabled = false;
      prevDisabled = false;
    }

    // Re-enable button in the case that the user has fetched the entire subcollection and button was disabled
    document.getElementById("showMore").disabled = false;
  };

  const fetchBanners = async (data) => {
    let banner;

    for (let i = 0; i < data.length; i++) {
      banner = await db
        .collection("banners")
        .doc(data[i].title)
        .get()
        .then((doc) => {
          return doc.data().banner;
        });
      data[i].banner = banner;
    }
  };

  function goPrev() {
    let i = weeks.indexOf($week);

    if ((document.getElementById("next-btn").disabled = true)) {
      document.getElementById("next-btn").disabled = false;
      nextDisabled = false;
    }

    if (i == 1) {
      $week = weeks[i - 1];
      updateItems();
      document.getElementById("prev-btn").disabled = true;
      prevDisabled = true;
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
      prevDisabled = false;
    }

    if (i + 1 == weeks.length - 1) {
      $week = weeks[i + 1];
      updateItems();
      document.getElementById("next-btn").disabled = true;
      nextDisabled = true;
    } else {
      $week = weeks[i + 1];
      updateItems();
    }
    console.log("Next clicked");
  }
</script>

<div class="filters">
  <button on:click={goPrev} class="arrow" id="prev-btn">
    <svg
      class:active={prevDisabled === false}
      class:disabled={prevDisabled === true}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="#fff"
      ><path
        d="M24 20.205L21.005 23.185L9.873 12L21.005 0.813972L24 3.79497L15.833 12L24 20.205V20.205ZM5.96 12L14.127 3.79497L11.132 0.814974L0 12L11.132 23.186L14.127 20.206L5.96 12V12Z"
      /></svg
    >
  </button>

  {#if seasons == 0}
    <select>
      <option value="">Loading...</option>
    </select>
  {:else}
    <!-- svelte-ignore a11y-no-onchange -->
    <select bind:value={$season} on:change={updateSeason}>
      {#each seasons as season}
        <option class="dropdown-item" value={season}>{season}</option>
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
        <option class="dropdown-item" value={week}
          >Week {parseInt(week.split("-")[1])}</option
        >
      {/each}
    </select>
  {/if}

  <button on:click={goNext} class="arrow" id="next-btn"
    ><svg
      class:active={nextDisabled === false}
      class:disabled={nextDisabled === true}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="#fff"
      ><path
        d="M0 3.795l2.995-2.98 11.132 11.185-11.132 11.186-2.995-2.981 8.167-8.205-8.167-8.205zm18.04 8.205l-8.167 8.205 2.995 2.98 11.132-11.185-11.132-11.186-2.995 2.98 8.167 8.206z"
      /></svg
    ></button
  >
</div>

<div class="rankings">
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
  .filters {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .dropdown-item {
    font-weight: inherit;
  }

  .rankings {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .arrow {
    width: 32px;
    height: 32px;
    align-self: flex-end;
  }

  .disabled {
    fill: var(--surface);
  }

  .active:hover {
    fill: var(--primary-color);
  }

  @media screen and (min-width: 425px) {
    div {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }
</style>
