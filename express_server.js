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
  res.redirect('/urls');
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
  if (id) {
    res.redirect('/urls');
  } else {
    res.render("user_login", templateVars);
  }
})

app.post("/login", (req, res) => {
  const password = req.body.password;
  const loginUser = getUserByEmail(req.body.email, users);
  if (loginUser && bcrypt.compareSync(password, loginUser.password)) {
    req.session.user_id = loginUser.id;
    res.redirect('/urls');
  } else {
    res.status(403).redirect(`/error/Incorrect password or username status code 403`);
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
  if (id) {
    res.redirect('/urls');
  } else {
    res.render("user_registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  let randomID = generateRandomString(12);
  const hashedPassword = bcrypt.hashSync(req.body.password,10);
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).redirect('/error/Please make sure to fill in all forms');
  } else if (getUserByEmail(req.body.email,users) !== undefined) {
    res.status(400).redirect('/error/That username is already take please choose something else'); 
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

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  if (user) {
    let urls = getUserUrls(urlDatabase, user);
    const templateVars = { 
      urls: urls,
      username: user
    }
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/error/Please sign in first to see your URLS');
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const id = req.session.user_id;
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: id};
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
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
      res.status(404).redirect('/error/You are not allowed to access that url');
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


app.post("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  if (id) {
    urlDatabase[req.body.shortURL] = {longURL: req.body.longURL, userID: id}; // req.params = :shortURL
    res.redirect(`/urls`);
  } else {
    res.sendStatus(403);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const id = req.session.user_id;
  const userUrls = getUserUrls(urlDatabase,users[id]);
  if (id && userUrls) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.sendStatus(403);
  }
});


// go to the shorturl
app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL]){
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL) {
      res.redirect(longURL);
    } 
  } else {
    res.redirect('/error/That URL is not in our database');
  }
});
 
app.get("/error/:message", (req,res) => {
  const id = req.session.user_id;
  const user = users[id];
  let templateVars = {username: undefined, urls: undefined, message: req.params.message};
  res.render('error_page', templateVars);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});