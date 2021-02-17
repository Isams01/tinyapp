const getUserByElement = (element, value, users) => {
  for(const key in users) {
    if (users[key][element] === value) {
      return users[key];
    }
  }
  return null;
}

module.exports = { getUserByElement };