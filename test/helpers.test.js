const { getUserUrls, getUserByEmail } = require('../helpers');
const chai = require('chai');
const assert = chai.assert;

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "userRandomID"},
  "aaabbb": {longURL: "http://www.youtube.com", userID: "user2RandomID"},
  "cccddd": {longURL: "http://www.reddit.com", userID: "user2RandomID"}
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "user3@example.com", 
    password: "dishwasher-funk3"
  }
}


describe('#getUserUrls', () => {
  it('should return urls created by the user when given the db and a user object', () => {
    const output1 = getUserUrls(urlDatabase,users['userRandomID']);
    const expectedOutput1 = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca", 
        userID: "userRandomID"
      },
      "9sm5xK": {
        longURL: "http://www.google.com", 
        userID: "userRandomID"
      }
    }

    assert.deepEqual(output1, expectedOutput1);
  });
  it('should return an empty object when there is no match', () => {
    const output = getUserUrls(urlDatabase, users['user3RandomID']);
    const expectedOutput = {};
    assert.deepEqual(output,expectedOutput);
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email ', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    assert.deepEqual(user.id,expectedOutput)
  });
  it('should return undefined if no match is found', () => {
    assert.isUndefined(getUserByEmail('user123@test.com',users));
  });
});