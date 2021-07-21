<script>
  import { db } from "./firebase";
  import Item from "./Item.svelte";

  let year = "2021";
  let season = "Summer";
  let period = "Week-02";

  let docsArr = (db, collection) => {
    return db
      .collection(year)
      .doc(season)
      .collection(collection)
      .orderBy("rank", "asc")
      .get()
      .then((snapshot) => snapshot.docs.map((x) => x.data()));
  };

  async function fetchData() {
    let rankings = await docsArr(db, period);
    return rankings;
  }
</script>

<div>
  {#await fetchData()}
    <p>loading</p>
  {:then items}
    {#each items as item}
      <Item {...item} />
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>

<style>
  /* your styles go here */
</style>
