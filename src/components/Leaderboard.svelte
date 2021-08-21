<script>
  import { onMount } from "svelte";
  import { Circle } from "svelte-loading-spinners";
  import { db, cf } from "../firebase";
  import Item from "./Item.svelte";
  import Modal from "./Modal.svelte";
  import {
    year,
    season,
    week,
    page,
    isActive,
    nextButtonState,
    prevButtonState,
    showMoreButtonState,
  } from "../stores";
  import { checkCache, cacheData } from "../cache";

  const color = "#f3667b";

  let seasons = [];
  let weeks = [];
  let items = [];
  let weekDisabled = false;

  // initialize page btn states
  const nextState = nextButtonState(false);
  const prevState = prevButtonState(false);
  const showMoreState = showMoreButtonState(false);
  const { next, enableNext, disableNext } = nextState;
  const { prev, enablePrev, disablePrev } = prevState;
  const { loading, fetching, fetched } = showMoreState;

  let query = db
    .collection($year)
    .doc($season)
    .collection($week)
    .orderBy("rank", "asc")
    .limit(10);

  onMount(async () => {
    // disable page btns on initial page load
    disablePrev();
    disableNext();

    items = await fetchData();
    seasons = await fetchSeasons();
    weeks = await fetchWeeks();

    // disable next btn as the latest week is always displayed on mount
    enablePrev();
    disableNext();
  });

  const fetchData = async () => {
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

      return data;
    }
  };

  const fetchNextData = async () => {
    fetching();
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
        if (data.length < 10) {
          document.getElementById("show-more").disabled = true;
        }
        fetched();
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
            document.getElementById("show-more").disabled = true;
          } else {
          }
          fetched();
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

      return seasons;
    }
  };

  const fetchWeeks = async () => {
    disablePrev();
    disableNext();
    let key = `${$season}-Weeks`;
    let cache = checkCache(key);

    if (cache.cachedData && !cache.expired) {
      weeks.length = 0;
      weeks = cache.cachedData.data;
      enablePrev();
      enableNext();
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

      enablePrev();
      enableNext();
      return weeks;
    }
  };

  const updateSeason = async () => {
    // When changing the season param, reset the week param and btn states
    weekDisabled = true;
    $week = "Week-01";

    await updateItems();
    await fetchWeeks();

    weekDisabled = false;
    disablePrev();
  };

  const updateItems = async () => {
    disablePrev();
    disableNext();

    let key = `${$season}-${$week}-page-1`;
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
    }

    if ($week == "Week-01") {
      disablePrev();
      enableNext();
    } else if ($week == "Week-12") {
      enablePrev();
      disableNext();
    } else {
      enablePrev();
      enableNext();
    }
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

    if ($next) {
      enableNext();
    }

    if (i == 1) {
      $week = weeks[i - 1];
      updateItems();
      disablePrev();
    } else {
      $week = weeks[i - 1];
      updateItems();
    }
    document.getElementById("show-more").disabled = false;
  }

  function goNext() {
    let i = weeks.indexOf($week);

    if ($prev) {
      enablePrev();
    }

    if (i + 1 == weeks.length - 1) {
      $week = weeks[i + 1];
      updateItems();
      disableNext();
    } else {
      $week = weeks[i + 1];
      updateItems();
    }
    document.getElementById("show-more").disabled = false;
  }
</script>

<div class="filters">
  <button
    on:click={goPrev}
    class="arrow"
    id="prev-btn"
    aria-label="Previous Page"
  >
    <svg
      class:active={!$prev}
      class:disabled={$prev}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      ><path
        d="M24 20.205L21.005 23.185L9.873 12L21.005 0.813972L24 3.79497L15.833 12L24 20.205V20.205ZM5.96 12L14.127 3.79497L11.132 0.814974L0 12L11.132 23.186L14.127 20.206L5.96 12V12Z"
      /></svg
    >
  </button>

  {#if seasons == 0}
    <select aria-label="Select Season">
      <option value="">Loading...</option>
    </select>
  {:else}
    <!-- svelte-ignore a11y-no-onchange -->
    <select
      bind:value={$season}
      on:change={updateSeason}
      aria-label="Select Season"
    >
      {#each seasons as season}
        <option class="dropdown-item" value={season}>{season}</option>
      {/each}
    </select>
  {/if}

  {#if weeks.length == 0 || weekDisabled}
    <select aria-label="Select Week">
      <option value="">Loading...</option>
    </select>
  {:else}
    <!-- svelte-ignore a11y-no-onchange -->
    <select bind:value={$week} on:change={updateItems} aria-label="Select Week">
      {#each weeks as week}
        <option class="dropdown-item" value={week}
          >Week {parseInt(week.split("-")[1])}</option
        >
      {/each}
    </select>
  {/if}

  <button on:click={goNext} class="arrow" id="next-btn" aria-label="Next Page"
    ><svg
      class:active={!$next}
      class:disabled={$next}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      ><path
        d="M0 3.795l2.995-2.98 11.132 11.185-11.132 11.186-2.995-2.981 8.167-8.205-8.167-8.205zm18.04 8.205l-8.167 8.205 2.995 2.98 11.132-11.185-11.132-11.186-2.995 2.98 8.167 8.206z"
      /></svg
    ></button
  >

  <Modal />
</div>

<div class="rankings">
  {#if items.length == 0}
    <div class="loading">
      <Circle size="64" unit="px" {color} />
    </div>
  {:else}
    {#each items as item}
      <Item {...item} isActive={$isActive} />
    {/each}
    <div class="show-more">
      <button on:click={fetchNextData} id="show-more">
        {#if $loading}
          <Circle size="32" unit="px" {color} />
        {:else}
          Show more rankings
        {/if}
      </button>
    </div>
  {/if}
</div>

<style>
  .loading {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

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

  @media screen and (min-width: 425px) {
    .rankings {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }

  .show-more {
    text-align: center;
  }

  #show-more {
    /* padding: 0.5rem; */
    font-size: 1.2rem;
  }

  #show-more:focus {
    text-decoration: underline;
    text-decoration-color: var(--primary-color);
  }

  #show-more:disabled {
    color: var(--surface);
    text-decoration: none;
  }

  .arrow {
    width: 32px;
    height: 32px;
    align-self: flex-end;
    fill: white;
  }

  .arrow:focus {
    fill: var(--primary-color);
  }

  .disabled {
    fill: var(--surface);
  }

  .active {
    fill: inherit;
  }

  .active:hover {
    fill: var(--primary-color);
  }
</style>
