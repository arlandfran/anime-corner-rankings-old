<script>
  import { afterUpdate } from "svelte";

  export let rank;
  export let previousRank;
  export let votes;
  export let previousVotes;
  let rankProgression;
  let voteDifference;

  afterUpdate(() => {
    rankProgression = calculateRankProgression(rank, previousRank);
    voteDifference = calculateVoteDifference(votes, previousVotes);
  });

  function calculateRankProgression(currentRank, previousRank) {
    if (previousRank == null) {
      return 0;
    } else if (currentRank < previousRank) {
      return previousRank - currentRank;
    } else {
      if (previousRank == currentRank) {
        return 0;
      } else {
        return previousRank - currentRank;
      }
    }
  }
  function calculateVoteDifference(currentVotes, previousVotes) {
    if (previousVotes == null) {
      return 0;
    } else {
      let difference = currentVotes - previousVotes;
      if (difference > 0) {
        return difference.toFixed(2);
      } else {
        return difference.toFixed(2);
      }
    }
  }
</script>

<div class="container border-tr border-br">
  <div class="sub-container">
    <div
      class="figure"
      class:arrow-gain={rankProgression > 0}
      class:arrow-neutral={rankProgression == 0}
      class:arrow-drop={rankProgression < 0}
    >
      {#if rankProgression < 0}
        {rankProgression.toString().replace("-", "")}
      {:else}
        {rankProgression}
      {/if}
    </div>
    {#if previousRank == null}
      <div class="label" class:neutral={previousRank == null}>NEW ENTRY</div>
    {:else if previousRank == rank}
      <div class="label" class:neutral={previousRank == rank}>SAME RANK</div>
    {:else}
      <div
        class="label"
        class:gain={rankProgression > 0}
        class:drop={rankProgression < 0}
      >
        FROM RANK {previousRank}
      </div>
    {/if}
  </div>
  <div class="sub-container border-br">
    <div class="figure border-br">{votes}%</div>
    {#if voteDifference > 0}
      <div class="label border-br" class:gain={voteDifference > 0}>
        +{voteDifference}% GAIN
      </div>
    {:else if voteDifference < 0}
      <div class="label border-br" class:drop={voteDifference < 0}>
        {voteDifference}% DROP
      </div>
    {:else}
      <div class="label border-br" class:neutral={voteDifference == 0}>
        NEW ENTRY
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: 10rem;
    height: 100%;
    font-weight: bold;
    text-align: center;
    background-color: #383838;
  }

  .sub-container {
    display: flex;
    flex-direction: column;
    height: 50%;
  }

  .figure {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .label {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.7rem;
  }

  @media screen and (min-width: 424px) {
    .label {
      font-size: 0.8rem;
    }
  }

  @media screen and (min-width: 767px) {
    .container {
      width: 20rem;
      flex-direction: row;
    }

    .sub-container {
      width: 100%;
      height: 100%;
    }

    .figure {
      height: 60%;
      font-size: 1.5rem;
    }

    .label {
      height: 40%;
    }
  }

  .border-tr {
    border-top-right-radius: 6px;
  }

  .border-br {
    border-bottom-right-radius: 6px;
  }

  .arrow-gain::before {
    color: #36c120;
    content: "⮅";
  }

  .arrow-neutral::before {
    color: #ffaf18;
    content: "⮂";
  }

  .arrow-drop::before {
    color: #dd0000;
    content: "⮇";
  }

  .gain {
    color: black;
    background-color: #36c120;
    /* border-bottom-right-radius: 4px; */
  }

  .neutral {
    color: black;
    background-color: #ffaf18;
  }

  .drop {
    background-color: #dd0000;
  }
</style>
