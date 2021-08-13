<script>
  import { afterUpdate } from "svelte";
  import { checkCache, cacheData } from "./cache";

  export let title;
  let src;

  afterUpdate(async () => {
    src = await fetchBannerImg();
  });

  const fetchBannerImg = async () => {
    let data;
    const key = `${title} Banner`;
    let cache = checkCache(key);

    if (cache.cachedData && !cache.expired) {
      return cache.cachedData.data;
    } else {
      const query = `
  query ($title: String){
    Media (search: $title, type: ANIME) {
      bannerImage
    }
  }
  `;

      const variables = {
        title: title,
      };

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      await axios({
        method: "post",
        url: "https://graphql.anilist.co/",
        headers,
        data: JSON.stringify({
          query: query,
          variables: variables,
        }),
      })
        .then((result) => {
          data = result.data.data.Media.bannerImage;

          if (data === null) {
            data =
              "https://raw.githubusercontent.com/arlandfran/anime-corner-rankings/main/assets/img/404-banner.jpg";
          }
        })
        .catch((err) => {
          data =
            "https://raw.githubusercontent.com/arlandfran/anime-corner-rankings/main/assets/img/404-banner.jpg";
          console.log(err.message);
        });

      cacheData(key, data);
    }

    return data;
  };
</script>

<div
  class="banner"
  style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url({src});"
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
