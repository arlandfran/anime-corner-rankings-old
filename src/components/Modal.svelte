<script>
  import { faq, modalState } from "../stores";
  import Accordion from "./Accordion.svelte";

  const state = modalState(false);
  const { isOpen, open, close } = state;

  let showAll = false;
  let showDropdown = false;

  function expandAll() {
    showAll = true;
    showDropdown = true;
  }

  function collapseAll() {
    showAll = false;
    showDropdown = false;
  }

  function keydown(e) {
    e.stopPropagation();
    if (e.key === "Escape") {
      close();
    }
  }

  // traps focus within modal by listening for modal transition ref: https://css-tricks.com/a-css-approach-to-trap-focus-inside-of-an-element/
  function transitionend(e) {
    const node = e.target;
    node.focus();
  }

  // ref: https://dev.to/vibhanshu909/how-to-create-a-full-featured-modal-component-in-svelte-and-trap-focus-within-474i
  function modalAction(node) {
    const returnFn = [];
    // for accessibility
    if (document.body.style.overflow !== "hidden") {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      returnFn.push(() => {
        document.body.style.overflow = original;
      });
    }
    node.addEventListener("keydown", keydown);
    node.addEventListener("transitionend", transitionend);
    node.focus();
    returnFn.push(() => {
      node.removeEventListener("keydown", keydown);
      node.removeEventListener("transitionend", transitionend);
    });
    return {
      destroy: () => returnFn.forEach((fn) => fn()),
    };
  }
</script>

<div>
  <button class="about" on:click={open}>
    <svg
      id="svg-info"
      width="24"
      height="24"
      xmlns="http://www.w3.org/2000/svg"
      fill-rule="evenodd"
      clip-rule="evenodd"
      ><path
        d="M24 17.981h-13l-7 5.02v-5.02h-4v-16.981h24v16.981zm-11-9.98h-2v6h2v-6zm-1-1.5c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25-1.25.56-1.25 1.25.56 1.25 1.25 1.25z"
      /></svg
    >
  </button>
</div>

{#if $isOpen}
  <div class="modal" use:modalAction tabindex="0">
    <div class="backdrop" />
    <div class="content-wrapper">
      <div class="close">
        <button on:click={close}>
          <svg
            id="svg-close"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="#fff"
            preserveAspectRatio="xMidYMid meet"
            ><path
              d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"
            /></svg
          >
        </button>
      </div>

      <div class="content">
        <div class="title">
          <h1>About</h1>
        </div>

        <h2>Legend</h2>
        <ul>
          <li><span id="green">⮅</span> Rank Progression</li>
          <li>% Vote Percentage</li>
        </ul>
        <h2>FAQ</h2>
        <div class="expand-toggles">
          <button
            class:active={!showAll}
            class:disabled={showAll}
            id="expand"
            disabled={showAll}
            on:click={expandAll}>Expand All</button
          >
          |
          <button
            class:active={showAll}
            class:disabled={!showAll}
            id="collapse"
            disabled={!showAll}
            on:click={collapseAll}>Collapse All</button
          >
        </div>
        {#each $faq as content}
          <Accordion {...content} {showAll} {showDropdown} />
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .about {
    width: 48px;
  }

  .modal {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;
  }

  .modal:not(:focus-within) {
    transition: opacity 0.1ms;
    opacity: 0.99;
  }

  .backdrop {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
  }

  .content-wrapper {
    position: fixed;
    z-index: 1;
    width: 90%;
    max-height: 80%;
    max-width: 1024px;
    padding-bottom: 3rem;
    border-radius: 6px;
    background-color: black;
    border: 2px solid white;
    overflow: hidden;
  }

  @media screen and (min-width: 769px) {
    .content-wrapper {
      width: 75%;
    }
  }

  .close {
    z-index: 2;
    position: absolute;
    top: 1.15rem;
    right: 1.4rem;
  }

  #svg-close:hover {
    fill: var(--primary-color);
  }

  .title {
    text-align: center;
  }

  .content {
    max-height: 80vh;
    padding: 1rem;
    text-align: left;
    overflow: auto;
  }

  h1,
  h2 {
    text-decoration: underline;
    text-decoration-color: var(--primary-color);
    text-underline-offset: 2px;
  }

  h1 {
    margin-block-start: 0;
    margin-block-end: 0;
    text-transform: uppercase;
  }

  #green {
    color: #36c120;
  }

  .about {
    fill: white;
  }

  .about:focus {
    fill: var(--primary-color);
  }

  #svg-info {
    fill: inherit;
  }

  #svg-info:hover {
    fill: var(--primary-color);
  }

  .active {
    color: var(--primary-color);
  }

  .disabled {
    color: var(--surface);
    cursor: default;
  }
</style>
