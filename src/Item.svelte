<script>
  export let rank;
  export let title;
  export let votes;

  let parentNode;

  // https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib
  function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function addDiv() {
    // const card = document.getElementsByClassName("card")[0];
    console.log(document.getElementsByClassName("card")[0]);

    const div = document.createElement("div");
    const text = document.createTextNode("Anime details...");
    div.appendChild(text);
    insertAfter(parentNode, div);
  }
</script>

<div class="card" on:click={addDiv} bind:this={parentNode}>
  <div class="card--rank">
    {rank}
  </div>
  <div class="card--title">
    {title}
  </div>
  <div class="card--votes">
    {votes}%
  </div>
</div>

<style>
  .card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    height: 4rem;
    padding-left: 1rem;
    padding-right: 1rem;
    background-color: var(--primary-color);
    border-radius: 4px;
  }
</style>
