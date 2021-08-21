<script>
  import { afterUpdate } from "svelte";

  export let rank;
  export let previousRank;
  export let votes;
  export let previousVotes;
  export let isActive;
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
    <div class="figure">
      {#if rankProgression < 0}
        <svg
          class="arrow-drop"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"><path d="M12 21l-12-18h24z" /></svg
        >
        {rankProgression.toString().replace("-", "")}
      {:else if rankProgression === 0}
        <svg
          class="arrow-neutral"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"><path d="M0 9h24v6h-24z" /></svg
        >
        {rankProgression}
      {:else}
        <svg
          class="arrow-gain"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"><path d="M24 22h-24l12-20z" /></svg
        >
        {rankProgression}
      {/if}
    </div>
    {#if previousRank == null}
      <div class="label" class:neutral={previousRank == null}>New Entry</div>
    {:else if previousRank == rank}
      <div class="label" class:neutral={previousRank == rank}>Same Rank</div>
    {:else}
      <div
        class="label"
        class:gain={rankProgression > 0}
        class:drop={rankProgression < 0}
      >
        From Rank {previousRank}
      </div>
    {/if}
  </div>
  <div class="sub-container border-br">
    <div class="figure border-br">{votes}%</div>
    {#if voteDifference > 0}
      <div
        class="label border-br"
        class:gain={voteDifference > 0}
        class:no-border-br={isActive}
      >
        +{voteDifference}% Gain
      </div>
    {:else if voteDifference < 0}
      <div
        class="label border-br"
        class:drop={voteDifference < 0}
        class:no-border-br={isActive}
      >
        {voteDifference}% Drop
      </div>
    {:else}
      <div
        class="label border-br"
        class:neutral={voteDifference == 0}
        class:no-border-br={isActive}
      >
        New Entry
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
    gap: 0.5rem;
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

  .arrow-gain {
    fill: var(--gain-color);
  }

  .arrow-neutral {
    fill: var(--neutral-color);
  }

  .arrow-drop {
    fill: var(--drop-color);
  }

  .gain {
    color: black;
    background-color: var(--gain-color);
  }

  .neutral {
    color: black;
    background-color: var(--neutral-color);
  }

  .drop {
    background-color: var(--drop-color);
  }
</style>
