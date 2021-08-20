<script>
  export let question;
  export let answer;
  export let showAll;

  let showDropdown = false;

  function toggleDropdown() {
    if (showAll) {
      showAll = false;
      showDropdown = false;
    } else {
      showDropdown = !showDropdown;
    }
  }
</script>

<div class="accordion" class:active={showDropdown} on:click={toggleDropdown}>
  <h3>{question}</h3>
</div>
{#if showDropdown || showAll}
  <div class="panel">
    {@html answer}
  </div>
{/if}

<style>
  .accordion {
    margin-left: -1rem;
    margin-right: -1rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
    cursor: pointer;
    /* transition: 0.4s; */
  }

  .active,
  .accordion:hover {
    color: var(--primary-color);
  }

  h3 {
    margin-block-start: 0;
    margin-block-end: 0;
    padding-left: 1rem;
    padding-right: 1rem;
  }
</style>
