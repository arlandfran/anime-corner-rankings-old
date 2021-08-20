/**
 * Checks if cachedData exists and if true returns cached data and expiry status.
 * @param {string} key localStorage Key that you want to retrieve the value of.
 */
export function checkCache(key) {
  const cacheLife = 86400; // Set cache lifetime to 24 hours in seconds
  let expired;
  let cachedData = localStorage.getItem(`${key}`); // Get cached data from local storage

  // If cached data exists then parse the data and check if data is expired
  if (cachedData) {
    cachedData = JSON.parse(cachedData);
    expired = parseInt(Date.now() / 1000) - cachedData.cachetime > cacheLife;
  }
  return {
    cachedData,
    expired,
  };
}

/**
 *  Takes a key and an object array that will be converted to a JSON string and saves that key: value pair in localStorage.
 * @param {string} key localStorage key that you want to create.
 * @param {array} data Array that will be converted to JSON and used as the value for the key you are creating.
 */
export function cacheData(key, data) {
  const cacheData = { data: data, cachetime: parseInt(Date.now() / 1000) };
  localStorage.setItem(`${key}`, JSON.stringify(cacheData));
}
