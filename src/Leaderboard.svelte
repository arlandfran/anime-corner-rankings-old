<script>
  import { onMount } from "svelte";
  import { db } from "./firebase";
  import Item from "./Item.svelte";

  let year = "2021";
  let season = "Summer";
  let period = "Week-03";

  let query = db
    .collection(year)
    .doc(season)
    .collection(period)
    .orderBy("rank", "asc")
    .limit(10);

  let items = [];

  onMount(async () => {
    items = await fetchData();
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

      console.log("Data fetched.");
      return data;
    }
  };

  const fetchNextData = async () => {
    let item = [];

    await query.get().then((snapshots) => {
      // Get the last visible document
      let lastVisible = snapshots.docs[snapshots.docs.length - 1];

      query = db
        .collection(year)
        .doc(season)
        .collection(period)
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
</script>

<div>
  {#each items as item}
    <Item {...item} />
  {/each}
</div>

<button on:click={fetchNextData} id="showMore">Show more rankings</button>

<style>
  /* your styles go here */
</style>
