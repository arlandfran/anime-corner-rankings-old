<script>
  export let isOpen;

  function open() {
    isOpen = true;
    console.log("isOpen:", isOpen);
  }
  function close() {
    isOpen = false;
    console.log("isOpen:", isOpen);
  }
</script>

<div>
  <button on:click={open}>About</button>
</div>

{#if isOpen}
  <div class="modal">
    <div class="backdrop" />
    <div class="content-wrapper">
      <div class="title"><h1>About</h1></div>
      <div class="content">
        <p>Content</p>
      </div>
      <div>
        <button on:click={close}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .backdrop {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
  }

  .content-wrapper {
    z-index: 1;
    width: 75%;
    border-radius: 0.3rem;
    background-color: black;
    overflow: hidden;
  }

  .content {
    max-height: 50vh;
    overflow: auto;
  }
</style>
