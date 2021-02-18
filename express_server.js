const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserUrls, getUserByEmail, generateRandomString } = require('./helpers');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "userRandomID"}
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
  }
}



app.get("/", (req, res) => {
  res.send("Hello!");
});

/*

    Login/logout handlers

*/
app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { 
    urls: urlDatabase,
    username: user
  };
  res.render("user_login", templateVars);
})

app.post("/login", (req, res) => {
  let randomID = '';
  const password = req.body.password;
  const loginUser = getUserByEmail(req.body.email, users);
  if (loginUser && bcrypt.compareSync(password, loginUser.password)) {
    randomID = loginUser.id;
    req.session.user_id = randomID;
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

/*

  Register handler

*/

app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { 
    urls: urlDatabase,
    username: user
  };
  res.render("user_registration", templateVars);
});

app.post("/register", (req, res) => {
  let randomID = generateRandomString(12);
  const hashedPassword = bcrypt.hashSync(req.body.password,10);
  if (req.body.email === '' || req.body.password === '' || getUserByEmail(req.body.email,users) !== null) {
    res.sendStatus(400);
  } else {
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = randomID;
    res.redirect("/urls");
  }
});

/*

  /urls handlers

*/

// Only give access to urls that user has made
// if (user[id] === urlDatabase[key].userID)
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  let templateVars = {username: undefined, urls: undefined};
  if (user) {
    let urls = getUserUrls(urlDatabase, user);
    templateVars = { 
      urls: urls,
      username: user
    }
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const id = req.session.user_id;
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: id};
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

// delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  if (id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls/`);
  } else {
    res.sendStatus(404);
  }
});

// create new url page
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (id) {
    const templateVars = { 
      urls: urlDatabase,
      username: user
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

// show short url page
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  let templateVars = {username: undefined, urls: undefined};
  if (user) {
    let urls = getUserUrls(urlDatabase, user);
    if (!urls[req.params.shortURL]) {
      res.sendStatus(404);
    } else {
      templateVars = {
      shortURL: req.params.shortURL,
      longURL: urls[req.params.shortURL].longURL,
      username: user
      }
      res.render("urls_show", templateVars);
    }
  } else {
    res.redirect('/urls');
  }
});

// add url
// TODO add check for valid url
app.post("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  if (id) {
    urlDatabase[req.body.shortURL] = {longURL: req.body.longURL, userID: id}; // req.params = :shortURL
    res.redirect(`/urls`);
  } else {
    res.sendStatus(404);
  }
});

// go to the shorturl
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.redirect('https://httpstatusdogs.com/304-not-modified')
  }
});
 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});