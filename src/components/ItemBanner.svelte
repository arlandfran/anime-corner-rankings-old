<script>
  export let banner;
  export let title;
</script>

<div
  class="banner"
  style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url({banner});"
>
  <div class="title">{title}</div>
</div>

<style>
  .banner {
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 100%;

    background-size: cover;
    background-position: center;
  }

  .title {
    padding-left: 0.5rem;
    padding-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: bold;
    text-transform: uppercase;
    text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.6);
  }
</style>
