const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const express = require('express');
const session = require('express-session');

const app = express();

app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: false }));

passport.use(new OIDCStrategy({
    clientID: 'your-client-id',
    clientSecret: 'your-client-secret',
    identityMetadata: 'https://login.microsoftonline.com/your-tenant-id/v2.0/.well-known/openid-configuration',
    responseType: 'code',
    responseMode: 'form_post',
    redirectUrl: 'http://localhost:3000/auth/openid/return',
    allowHttpForRedirectUrl: true,
    validateIssuer: false,
    passReqToCallback: false,
    scope: ['profile', 'email']
}, (iss, sub, profile, accessToken, refreshToken, done) => {
    return done(null, profile);
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('<a href="/login">Login with Azure AD</a>');
});

app.get('/login', passport.authenticate('azuread-openidconnect'));

app.post('/auth/openid/return', passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile');
});

app.get('/profile', (req, res) => {
    const user = req.user;
    res.send(`Welcome, ${user.displayName} (${user.emails[0]})`);
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
