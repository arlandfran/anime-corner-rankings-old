# Where the data comes from

Back to [README](../README.md)

## Web Scraping

The data needed for this project is scraped from [animecorner.me](https://animecorner.me/category/anime-corner/rankings/) and from Spring 2021 onwards are stored in table format. Rankings posted pre-Spring 2021 were posted in list format and a different script has been written to accomodate for the change in structure. The scraper requirements were as follows:

1. Navigate to https://animecorner.me/category/anime-corner/rankings/anime-of-the-week/, the central repository for anime of the week blog posts
2. Grab the URL for the latest ranking
3. Navigate to that URL
4. Grab the table containing the rankings
5. Iterate through the table rows and contstruct a JSON object from cell values
6. Post that data to the database

Example:

Turn this table:

| **Rank** | **Title**                      | **Votes** |
| -------- | ------------------------------ | --------- |
| 1        | Remake our Life!               | 9.62%     |
| 2        | Miss Kobayashi's Dragon Maid S | 8.31%     |
| 3        | The Duke of Death and His Maid | 7.96%     |
| ...      | ...                            | ...       |

into this JSON object:

```
{
  ...
  "rankings": [
    {
      "rank": 1,
      "title: "Remake our Life!",
      "votes": 9.62
    },
    {
      "rank": 2,
      "title: "Miss Kobayashi's Dragon Maid S",
      "votes": 8.31
    },
    {
      "rank": 3,
      "title: "The Duke of Death and His Maid",
      "votes": 7.96
    },
    ...
  ]
}
```

then push to Firestore:

![Firestore screen snip](../assets/img/snips/firestore-snip.png)

As Firestore is a document-model database comprising of documents and collections, the data is stored like this:

- **Year** (Top Level Collection)
  - **Season** (Document)
    - **Period** (Sub-collection)
      - **Item** (Document)
        - Field - Value
        - Field - Value
        - Field - Value

The script requires 3 packages:

- Axios - Promise based HTTP client, used to retrieve our HTML
- Cheerio - HTML Parser, pull the data we need from the HTML
- Firebase-admin - Admin SDK for Firebase services, provides server-access to Firestore
