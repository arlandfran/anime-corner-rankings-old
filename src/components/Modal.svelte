<script>
  import { modalState } from "../stores";

  const state = modalState(false);
  const { isOpen, open, close } = state;
</script>

<div>
  <button on:click={open}>About</button>
</div>

{#if $isOpen}
  <div class="modal">
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
          <h3>What is Anime Corner Rankings?</h3>
          <div class="panel">
            This site tracks the weekly rankings released by Anime Corner, an
            online community that provides news, highlights and articles on the
            anime industry. In particular the site displays their list in an
            interactive leaderboard that can expand to show you more information
            about a show if it catches your interest.
          </div>
        </div>
        <div class="accordion">
          <h3>Where does the data come from?</h3>
          <div class="panel">
            The poll data is collected by Anime Corner and published on their
            website in the Rankings category. If you want to learn more about
            how the data is collected and calculated here.<br /><br /> The all time
            ratings, genre tags, streaming platform(s) and overview are all provided
            by Anilist.co.
          </div>
        </div>
        <div class="accordion">
          <h3>How often are the rankings updated?</h3>
          <div class="panel">
            The rankings are updated every Friday at approximately 13:00pm UTC.
          </div>
        </div>
        <div class="accordion">
          <h3>How can I vote?</h3>
          <div class="panel">
            You can cast your vote over at polls.animecorner.me
          </div>
        </div>
        <div class="accordion">
          <h3>Are there similar rankings out there?</h3>
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
          <h3>How can I contact you?</h3>
          <div class="panel">
            If you have any have questions, feedback or suggestions about the
            site, please feel free and create an issue on the project repository
            or even better make a PR yourself!
          </div>
        </div>
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
    opacity: 1;
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
    width: 75%;
    max-height: 80%;
    border-radius: 0.3rem;
    background-color: black;
    border: 2px solid white;
    overflow: hidden;
  }

  .close {
    z-index: 2;
    position: absolute;
    top: -0.2rem;
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

  h1 {
    margin-block-start: 0;
    margin-block-end: 0;
    text-transform: uppercase;
  }
</style>
