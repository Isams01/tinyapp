const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { generateRandomString } = require('./generate-random-string');
const { getUserByElement } = require('./getUserByElement');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { 
    urls: urlDatabase,
    username: user
  };
  res.render("user_login", templateVars);
})

app.post("/login", (req, res) => {
  let loginStatus = false;
  let randomID = '';
  for(const key in users) {
    if (users[key].email === req.body.email && users[key].password === req.body.password) {
      loginStatus = true;
      randomID = users[key].id;
    }
  }
  if (loginStatus) {
    res.cookie('user_id', randomID);
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

/*

  Register handler

*/

app.get("/register", (req, res) => {
  const id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { 
    urls: urlDatabase,
    username: user
  };
  res.render("user_registration", templateVars);
});

app.post("/register", (req, res) => {
  let randomID = generateRandomString(12);
  let hasEmail = false;
  for(const key in users) {
    if (users[key].email === req.body.email) {
      hasEmail = true;
    }
  }
  if (req.body.email === '' || req.body.password === '' || hasEmail === true) {
    res.sendStatus(400);
  } else {
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', randomID);
    res.redirect("/urls");
  }
});
/*

  /urls handlers

*/

app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"]
  const user = users[id];
  const templateVars = { 
    urls: urlDatabase,
    username: user
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6)
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

// delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);         // Respond with 'Ok' (we will replace this)
});

// create new url page
app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"]
  const user = users[id];
  const templateVars = { 
    urls: urlDatabase,
    username: user
  };
  res.render("urls_new", templateVars);
});

// show short url page
app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies["user_id"]
  const user = users[id];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: user
  };
  res.render("urls_show", templateVars);
});

// add url
// TODO add check for valid url
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.body.shortURL] = req.body.longURL; // req.params = :shortURL
  res.redirect(`/urls`);
});

// go to the shorturl
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.redirect('https://httpstatusdogs.com/304-not-modified')
  }
});
 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});