const getUserUrls = (urlDB, user) => {
  let urls = {};
  for (const key in urlDB) {
    if (urlDB[key].userID === user.id) {
      urls[key] = urlDB[key]
    }
  }
  return urls;
}

const getUserByEmail = (email, users) => {
  for(const key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return undefined;
}

function generateRandomString(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = { getUserUrls, getUserByEmail, generateRandomString }