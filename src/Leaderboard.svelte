<script>
  import { onMount } from "svelte";
  import { db } from "./firebase";
  import Item from "./Item.svelte";

  let year = "2021";
  let season = "Summer";
  let period = "Week-02";

  let items = [];

  onMount(async () => {
    items = await fetchData();
  });

  const fetchData = async () => {
    // Set cache lifetime in seconds
    var cacheLife = 86400; // 24 hours
    // Get cached data from local storage
    var cachedData = localStorage.getItem("items");

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
      var data = await db
        .collection(year)
        .doc(season)
        .collection(period)
        .orderBy("rank", "asc")
        .limit(10)
        .get()
        // Converts firestore collection into array of documents
        .then((snapshot) => snapshot.docs.map((doc) => doc.data()));

      // Save data in local storage
      var cacheData = { data: data, cachetime: parseInt(Date.now() / 1000) };
      localStorage.setItem("items", JSON.stringify(cacheData));

      console.log("Data fetched.");
      return data;
    }
  };
</script>

<div>
  {#each items as item}
    <Item {...item} />
  {/each}
</div>

<style>
  /* your styles go here */
</style>
