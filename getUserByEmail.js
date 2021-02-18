const getUserByEmail = (email, users) => {
  for(const key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
}

module.exports = { getUserByEmail };