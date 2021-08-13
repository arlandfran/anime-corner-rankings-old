<script>
  import { db } from "../firebase";
  import { year, season, week } from "../stores";
  export let rank;
  export let title;
  export let votes;

  function decrementWeek(week) {
    let n = parseInt(week.split("-")[1]);
    n = n - 1;

    if (n > 10) {
      return "Week-" + n.toString();
    } else {
      return "Week-0" + n.toString();
    }
  }

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

  const fetchDetails = async () => {
    let details;

    const query = db
      .collection($year)
      .doc($season)
      .collection(decrementWeek($week))
      .where("title", "==", title);

    let data = await query
      .get()
      .then((snapshots) => snapshots.docs.map((doc) => doc.data()));

    details = {
      progression: calculateRankProgression(rank, data[0].rank),
      previousRank: data[0].rank,
      voteDifference: calculateVoteDifference(votes, data[0].votes),
    };

    return details;
  };
</script>

{#await fetchDetails()}
  <div class="container">Loading...</div>
{:then details}
  <div class="container">
    <div class="sub-container">
      <div class="figure">{details.progression}</div>
      <div class="label">FROM RANK {details.previousRank}</div>
    </div>
    <div class="sub-container">
      <div class="figure">{votes}</div>
      <div class="label">{details.voteDifference}</div>
    </div>
  </div>
{/await}

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
