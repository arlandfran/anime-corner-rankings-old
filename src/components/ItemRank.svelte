<script>
  export let rank;
</script>

<div>
  {rank}
</div>

<style>
  div {
    width: 4rem;
    font-size: x-large;
    font-weight: bold;
    text-align: center;
  }

  @media screen and (min-width: 767px) {
    div {
      width: 8rem;
    }
  }
</style>
