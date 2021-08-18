const axios = require("axios");
const cheerio = require("cheerio");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Main script logic
const main = async () => {
  console.log("Start");
  const page = await getRankingsPage();
  let data = await scrapePage(page);
  let details = await fetchAnilistDetails(data);
  // Add anime details to the respective anime object as new props
  for (anime in data.rankings) {
    data.rankings[anime].description = details[anime].description;
    data.rankings[anime].genres = details[anime].genres;
    data.rankings[anime].externalLinks = details[anime].externalLinks;
  }
  await fetchPreviousRankings(data);
  await writeDataToFirestore(data);
  let titles = extractTitles();
  let existingBanners = await fetchExistingBanners();
  let bannersToFetch = await checkForExistingEntries(existingBanners, titles);
  let newBanners = await fetchAnilistBanners(bannersToFetch);
  await writeBannersToFirestore(newBanners);
  console.log("Done");
};

// Returns latest ranking url anime-of-the-week post list
const getRankingsPage = async () => {
  const baseURL =
    "https://animecorner.me/category/anime-corner/rankings/anime-of-the-week/";

  // Get page that contains the latest rankings
  const page = await axios({
    method: "get",
    url: baseURL,
  })
    .then((res) => {
      let $ = cheerio.load(res.data);

      // Get latest ranking page url which contains our table data
      let page = $(".penci-wrapper-data")
        .children()
        .first()
        .children()
        .first()
        .children()
        .last()
        .children()
        .first()
        .find("h2")
        .find("a")
        .attr("href");

      return page;
    })
    .catch((err) =>
      console.log(`Axios: Error fetching ${baseUrl}:`, err.message)
    );
  return page;
};

// Scrapes table, parses data and returns data object
const scrapePage = async (page) => {
  console.log(`Scraping ${page}...`);
  let data = await axios({
    method: "get",
    url: page,
  })
    .then((res) => {
      let $ = cheerio.load(res.data);

      let data;
      let rankings = [];

      // Expected format: {season} {year} Top Anime Rankings – Week {week}
      let title = $("h1.post-title").text().split(" ");

      // Select tbody element and iterate through each table row to push each table cell to rankings array
      $("tbody tr").each((tr_index, tr) => {
        rankings[tr_index] = {
          rank: parseInt($(tr).children().first().text()),
          title: $(tr).children().first().next().text(),
          votes: parseFloat($(tr).children().last().text()),
        };
      });

      data = {
        year: title[1],
        season: title[0],
        week: "Week-" + title.pop(),
        rankings: rankings,
      };

      return data;
    })
    .catch((err) => console.log(`Axios: Error fetching ${page}`, err.message));
  return data;
};

// Takes data object as argument and writes to firestore
const writeDataToFirestore = async (data) => {
  console.log("Writing to firestore...");
  const doc = db.collection(data.year).doc(data.season).collection(data.week);

  for (anime in data.rankings) {
    await doc
      .add(data.rankings[anime])
      .catch((err) => console.log("Error adding document: ", err));
    console.log(`${data.rankings[anime].title} added`);
  }

  console.log(
    `${data.year} ${data.season} Top Anime Rankings - ${data.week} successfully added to database`
  );
};

// Fetch anime details using Anilist API
const fetchAnilistDetails = async (data) => {
  console.log("Rankings scraped, fetching anime details...");
  // Contains all anime details
  let details = [];

  // Extract titles into titles array for easier querying
  let titles = [];
  for (anime in data.rankings) {
    titles.push(data.rankings[anime].title);
  }

  // Make an API request for every title
  for (title in titles) {
    const query = `
    query ($title: String){
      Media (search: $title, type: ANIME) {
        description
        genres
        externalLinks {
          site
          url
        }
      }
    } 
    `;

    const variables = {
      title: titles[title],
    };

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Fetch data from Anilist
    await axios({
      method: "post",
      url: "https://graphql.anilist.co/",
      headers,
      data: JSON.stringify({
        query: query,
        variables: variables,
      }),
    })
      // Push API response to details array
      .then((res) => {
        details.push(res.data.data.Media);
        console.log(`${titles[title]} details fetched`);
      })
      .catch(async (err) => {
        // Otherwise try Kitsu API
        console.log(
          `Error fetching ${titles[title]} Details, trying Kitsu...`,
          err.message
        );

        details.push(await fetchKitsuDetails(titles[title]));
      });
  }
  // Remove links that are not Crunchyroll or Funimation
  stripLinks(details);
  return details;
};

// Fallback API call for anime details
// Parses response so that both anime API calls are structured the same
const fetchKitsuDetails = async (title) => {
  let genres = [];
  let links = [];

  const query = `
            query($title: String!) {
  searchAnimeByTitle(first: 1, title: $title) {
    nodes {
      description
      categories(first: 10) {
        nodes {
          slug
        }
      }
      streamingLinks(first: 5) {
        nodes {
          streamer {
            siteName
          }
          url
        }
      }
    }
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

  // Fetch data and store response in data variable
  let data = await axios({
    method: "post",
    url: "https://kitsu.io/api/graphql",
    headers,
    data: JSON.stringify({
      query: query,
      variables: variables,
    }),
  })
    .then((res) => {
      console.log(`${title} details fetched`);
      return res.data.data.searchAnimeByTitle.nodes[0];
    })
    .catch((err) =>
      console.log(`Error fetching ${title} Details:`, err.message)
    );

  // Loop over category node and adds values to genres array
  for (category in data.categories.nodes) {
    genres.push(data.categories.nodes[category].slug);
  }

  // Loops over streamer node and only pushes to links array if streamer is Crunchyroll or Funimation
  for (streamer in data.streamingLinks.nodes) {
    if (
      data.streamingLinks.nodes[streamer].streamer.siteName == "Crunchyroll" ||
      data.streamingLinks.nodes[streamer].streamer.siteName == "Funimation"
    ) {
      links.push({
        site: data.streamingLinks.nodes[streamer].streamer.siteName,
        url: data.streamingLinks.nodes[streamer].url,
      });
    }
  }

  // Return object structured like Anilist response
  data = {
    description: data.description.en,
    genres: genres,
    externalLinks: links,
  };

  return data;
};

// Mutates externalLinks prop so that it only contains either Crunchyroll or Funimation links or both or an empty []
function stripLinks(data) {
  for (item in data) {
    let links = [];
    for (link in data[item].externalLinks) {
      if (
        data[item].externalLinks[link].site == "Crunchyroll" ||
        data[item].externalLinks[link].site == "Funimation"
      ) {
        links.push({
          site: data[item].externalLinks[link].site,
          url: data[item].externalLinks[link].url,
        });
      }
    }
    data[item].externalLinks = links;
  }
}

// Fetch the previous ranks and votes of each anime object
const fetchPreviousRankings = async (data) => {
  console.log("Details fetched, fetching previous weeks data...");
  // Decrement week
  let previousWeek;
  let n = parseInt(data.week.split("-")[1]);
  n -= 1;
  if (n > 10) {
    previousWeek = "Week-" + n.toString();
  } else {
    previousWeek = "Week-0" + n.toString();
  }

  const query = db
    .collection(data.year)
    .doc(data.season)
    .collection(previousWeek);

  // All animes found in Week 1 are new entries so make values null
  if (previousWeek == "Week-00") {
    for (anime in data.rankings) {
      data.rankings[anime].previousRank = null;
      data.rankings[anime].previousVotes = null;
    }
  } else {
    for (anime in data.rankings) {
      let previousData = await query
        .where("title", "==", data.rankings[anime].title)
        .get()
        .then((snapshots) => snapshots.docs.map((doc) => doc.data()));
      // If anime is a new entry then make values null
      if (previousData[0] == undefined) {
        data.rankings[anime].previousRank = null;
        data.rankings[anime].previousVotes = null;
      } else {
        // Otherwise return previous rank and votes
        data.rankings[anime].previousRank = previousData[0].rank;
        data.rankings[anime].previousVotes = previousData[0].votes;
      }
      console.log(`${data.rankings[anime].title}: Previous data fetched`);
    }
  }
};

// Return array that contains anime titles in the weekly ranking
function extractTitles(data) {
  let titles = [];
  for (anime in data.rankings) {
    titles.push(data.rankings[anime].title);
  }
  return titles;
}

const fetchExistingBanners = async () => {
  const banners = await db
    .collection("banners")
    .get()
    .then((snapshots) => snapshots.docs.map((doc) => doc.id));
  console.log("Existing banners:", banners.length);
  return banners;
};

function checkForExistingEntries(existingBanners, titles) {
  const toRemove = new Set(existingBanners);

  //Code adapted from: https://stackoverflow.com/a/44204227
  const noMatch = titles.filter((title) => !toRemove.has(title)); // returns array with banners that are new
  const match = titles.filter((title) => toRemove.has(title)); // returns array with banners that are already in collection

  console.log("Banners already in DB:", match.length);
  console.log("Banners to be added:", noMatch.length);

  return noMatch;
}

// Fetch banner images using Anilist API and returns banner array
const fetchAnilistBanners = async (titles) => {
  let title;
  let banner;
  let banners = [];

  // Make an API call for every anime object in data
  for (let i = 0; i < titles.length; i++) {
    title = titles[i];

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

    // Fetch banner from Anilist
    await axios({
      method: "post",
      url: "https://graphql.anilist.co/",
      headers,
      data: JSON.stringify({
        query: query,
        variables: variables,
      }),
    })
      // Assign response to banner variable
      .then(async (res) => {
        banner = res.data.data.Media.bannerImage;
        console.log(`${title} - Banner found`);

        // Sometimes Anilist will return null with status code 200
        if (banner === null) {
          console.log("No Anilist Banner Found, trying Kitsu...");
          banner = await fetchKitsuBanners(title);
        }
      })
      // Fetch banner from Kitsu if status code 404
      .catch(async (err) => {
        console.log(
          "Error fetching Anilist Banners, trying Kitsu...",
          err.message
        );
        banner = await fetchKitsuBanners(title);
      });

    banners.push({ title: title, banner: banner });
  }
  return banners;
};

// Fallback API call for banner and returns single banner response
const fetchKitsuBanners = async (title) => {
  let banner;

  const query = `
query ($title: String!){
  searchAnimeByTitle (first: 1, title: $title) {
    nodes {
      bannerImage {
        original {
          url
        }
      }
    }
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
    url: "https://kitsu.io/api/graphql",
    headers,
    data: JSON.stringify({
      query: query,
      variables: variables,
    }),
  })
    .then(async (res) => {
      // Return 404 banner if Kitsu.io's hardcoded url is returned
      if (
        res.data.data.searchAnimeByTitle.nodes[0].bannerImage.original.url ==
        "/cover_images/original/missing.png"
      ) {
        console.log("No Kitsu Banner Found, returning 404 Banner");
        banner =
          "https://raw.githubusercontent.com/arlandfran/anime-corner-rankings/main/assets/img/404-banner.jpg";
      } else {
        // Otherwise assign response to banner variable
        banner =
          res.data.data.searchAnimeByTitle.nodes[0].bannerImage.original.url;
        console.log(`${title} - Banner found`);
      }
    })
    .catch((err) => {
      console.log(
        "Error fetching Kitsu Banner, returning 404 Banner:",
        err.message
      );
      banner =
        "https://raw.githubusercontent.com/arlandfran/anime-corner-rankings/main/assets/img/404-banner.jpg";
    });
  return banner;
};

// Takes banner array and writes to firestore
const writeBannersToFirestore = async (banners) => {
  const doc = db.collection("banners");

  for (let i = 0; i < banners.length; i++) {
    doc
      .doc(banners[i].title)
      .set({ banner: banners[i].banner })
      .catch((err) => console.log("Error adding banner:", err.message));
  }

  console.log("Banners successfully added to database");
};

main(); // Execute main script
