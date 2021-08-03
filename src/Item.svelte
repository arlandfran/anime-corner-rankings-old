<script>
  export let rank;
  export let title;
  export let votes;
</script>

<div class="card">
  <div class="card--rank">
    {rank}
  </div>
  <div class="card--title">
    {title}
  </div>
  <div class="card--votes">
    {votes}%
  </div>
</div>

<style>
  .card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    height: 4rem;
    padding-left: 1rem;
    padding-right: 1rem;
    background-color: var(--primary-color);
    border-radius: 4px;
  }
</style>
