<script>
  import { onMount } from "svelte";
  import { db, cf } from "./firebase";
  import Item from "./Item.svelte";
  import { year, season, week } from "./stores";

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
  });

  const fetchData = async () => {
    // Set cache lifetime in seconds
    let cacheLife = 86400; // 24 hours
    // Get cached data from local storage
    let cachedData = localStorage.getItem("items");

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
      let data = await query
        .get()
        // Converts firestore collection into array of documents
        .then((snapshots) => snapshots.docs.map((doc) => doc.data()));

      // Save data in local storage
      let cacheData = { data: data, cachetime: parseInt(Date.now() / 1000) };
      localStorage.setItem("items", JSON.stringify(cacheData));

      console.log("Data fetched:", data);
      return data;
    }
  };

  const fetchNextData = async () => {
    let item = [];

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

      query.get().then((snapshots) => {
        // Converts newly fetched collection into array of documents
        let data = snapshots.docs.map((doc) => doc.data());

        // Update items array with new documents
        for (let i = 0; i < data.length; i++) {
          item = {
            rank: data[i].rank,
            title: data[i].title,
            votes: data[i].votes,
          };
          items = [...items, item];
        }

        // Disable show more button if there is no more data to be fetched
        if (snapshots.size < 10) {
          document.getElementById("showMore").disabled = true;
          console.log("No more data to be fetched");
        } else {
          console.log("Next batch of data fetched");
        }
      });
    });
  };

  const fetchSeasons = async () => {
    let seasonQuery = db.collection($year);

    await seasonQuery.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        seasons = [...seasons, doc.id];
      });
    });
    console.log("Seasons fetched:", seasons);
    return seasons;
  };

  const fetchWeeks = async () => {
    weeks.length = 0;
    const fetchSubCollections = cf.httpsCallable("fetchSubCollections");
    await fetchSubCollections({ year: $year, season: $season }).then(
      (result) => {
        weeks = result.data;
      }
    );
    console.log("Weeks fetched:", weeks);
    return weeks;
  };

  const updateSeason = async () => {
    $week = "Week-01"; // When changing the season param, reset the week param to the start

    await updateItems();
    await fetchWeeks();
  };

  const updateItems = async () => {
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

    for (let i = 0; i < data.length; i++) {
      item = {
        rank: data[i].rank,
        title: data[i].title,
        votes: data[i].votes,
      };
      items = [...items, item];
    }
    console.log("Items array updated");
    // Re-enable button in the case that the user has fetched the entire subcollection and button was disabled
    document.getElementById("showMore").disabled = false;
  };
</script>

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

<p>The current params are {$season} {$week}</p>

<div>
  {#if items.length == 0}
    <p>Loading...</p>
  {:else}
    {#each items as item}
      <Item {...item} />
    {/each}
  {/if}
</div>

<button on:click={fetchNextData} id="showMore">Show more rankings</button>

<style>
  /* your styles go here */
</style>
