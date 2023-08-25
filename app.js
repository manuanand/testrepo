const express = require('express');
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const session = require('express-session');

const app = express();


// Configure session
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Configure Passport
passport.use(new OIDCStrategy({
  identityMetadata: 'https://login.microsoftonline.com/64dc69e4-d083-49fc-9569-ebece1dd1408/v2.0/.well-known/openid-configuration',
  clientID: '5d144c3c-28c1-47b8-a50f-aa78ffe78aba',
  responseType: 'code id_token',
  responseMode: 'form_post',
  redirectUrl: 'http://localhost:3000/auth/openid/return',
  allowHttpForRedirectUrl: true,
  clientSecret: 'j3U8Q~Gi-3C9ccrmuqdYPkhc2JHw.MRlULKKnch~',
  validateIssuer: false,
  passReqToCallback: false,
  
  scope: ['profile', 'email'],
}, (iss, sub, profile, accessToken, refreshToken, done) => {
  return done(null, profile);
}));

app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.get('/', (req, res) => {
  res.send('Home Page');
});

app.get('/login', passport.authenticate('azuread-openidconnect'));

app.post('/auth/openid/return', passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/profile');
});

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Hello, ${req.user.displayName}!<br><a href="/logout">Logout</a>`);
  } else {
    res.redirect('/');
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
