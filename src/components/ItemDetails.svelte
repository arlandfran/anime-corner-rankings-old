<script>
  export let rank;
  export let previousRank;
  export let votes;
  export let previousVotes;

  function calculateRankProgression(currentRank, previousRank) {
    if (currentRank < previousRank) {
      return `⮅ ${previousRank - currentRank}`;
    } else {
      return `⮇ ${(previousRank - currentRank) * -1}`;
    }
  }
  function calculateVoteDifference(currentVotes, previousVotes) {
    let difference = currentVotes - previousVotes;
    if (difference > 0) {
      return `+${difference.toFixed(2)} GAIN`;
    } else {
      return `${difference.toFixed(2)} DROP`;
    }
  }

  let rankProgression = calculateRankProgression(rank, previousRank);
  let voteDifference = calculateVoteDifference(votes, previousVotes);
</script>

<div class="container">
  <div class="sub-container">
    <div class="figure">{rankProgression}</div>
    <div class="label">FROM RANK {previousRank}</div>
  </div>
  <div class="sub-container">
    <div class="figure">{votes}</div>
    <div class="label">{voteDifference}</div>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: 10rem;
    height: 100%;
    text-align: center;
  }

  .sub-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 50%;
  }

  .figure {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .label {
    font-size: 0.8rem;
  }
</style>
