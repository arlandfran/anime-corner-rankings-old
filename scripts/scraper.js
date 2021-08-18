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
  await writeDataToFirestore(data);
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

// Execute main script
main();
