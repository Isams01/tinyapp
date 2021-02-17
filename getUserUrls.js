const getUserUrls = (urlDB, user) => {
  let urls = {};
  for (const key in urlDB) {
    if (urlDB[key].userID === user.id) {
      urls[key] = urlDB[key]
    }
  }
  return urls;
}

module.exports = { getUserUrls }