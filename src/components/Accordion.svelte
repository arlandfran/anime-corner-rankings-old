<script>
  import { slide } from "svelte/transition";

  export let question;
  export let answer;
  export let showAll;
  export let showDropdown;

  function toggleDropdown() {
    if (showAll) {
      showAll = false;
      showDropdown = false;
    } else {
      showDropdown = !showDropdown;
    }
  }
</script>

<div
  class="accordion"
  class:active={showDropdown}
  on:click={toggleDropdown}
  on:keypress={toggleDropdown}
  tabindex="0"
>
  <h3>{question}</h3>
</div>
{#if showDropdown || showAll}
  <div class="panel" transition:slide={{ duration: 200 }}>
    {@html answer}
  </div>
{/if}

<style>
  .accordion {
    display: flex;
    align-items: center;
    margin-left: -1rem;
    margin-right: -1rem;
    height: 4rem;
    cursor: pointer;
    border-top: 1px solid white;
    border-bottom: 1px solid white;
  }

  .active,
  .accordion:hover,
  .accordion:focus {
    color: var(--primary-color);
  }

  .panel {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  @media (prefers-reduced-motion) {
    .panel {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      animation-delay: 0.01ms !important;
    }
  }

  h3 {
    margin-block-start: 0;
    margin-block-end: 0;
    padding-left: 1rem;
    padding-right: 1rem;
  }
</style>
