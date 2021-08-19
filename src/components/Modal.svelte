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
        <h2>Legend</h2>
        <ul>
          <li>⮅ Rank Progression</li>
          <li>% Vote Percentage</li>
        </ul>
        <h2>FAQ</h2>
        <div class="expand-toggles">
          <button>Expand All</button>
          |
          <button>Collapse All</button>
        </div>
        <div class="accordion">
          What is Anime Corner Rankings?
          <div class="panel">
            This site tracks the weekly rankings released by Anime Corner, an
            online community that provides news, highlights and articles on the
            anime industry. In particular the site displays their list in an
            interactive leaderboard that can expand to show you more information
            about a show if it catches your interest.
          </div>
        </div>
        <div class="accordion">
          Where does the data come from?
          <div class="panel">
            The poll data is collected by Anime Corner and published on their
            website in the Rankings category. If you want to learn more about
            how the data is collected and calculated here.<br /><br /> The all time
            ratings, genre tags, streaming platform(s) and overview are all provided
            by Anilist.co.
          </div>
        </div>
        <div class="accordion">
          How often are the rankings updated?
          <div class="panel">
            The rankings are updated every Friday at approximately 13:00pm UTC.
          </div>
        </div>
        <div class="accordion">
          How can I vote?
          <div class="panel">
            You can cast your vote over at polls.animecorner.me
          </div>
        </div>
        <div class="accordion">
          Are there similar rankings out there?
          <div class="panel">
            Yes this site was actually inspired by some of these sites here:
            <ul>
              <li>animekarmalist.com</li>
              <li>animekarmawatch.com</li>
              <li>animetrics.co</li>
              <li>anitrendz.net</li>
            </ul>
          </div>
        </div>
        <div class="accordion">
          How can I contact you?
          <div class="panel">
            If you have any have questions, feedback or suggestions about the
            site, please feel free and create an issue on the project repository
            or even better make a PR yourself!
          </div>
        </div>
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
    padding: 1rem;
    border-radius: 0.3rem;
    background-color: black;
    overflow: hidden;
    border: 2px solid white;
  }

  .content {
    max-height: 50vh;
    overflow: auto;
    text-align: left;
  }

  h1 {
    text-transform: uppercase;
  }
</style>
