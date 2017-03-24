const express = require('express');
const passport = require('passport');
const methodOverride = require('method-override');
const app = express();
const logger = require("morgan");
var session = require('express-session');
const bodyParser = require('body-parser');
const GitHubStrategy = require('passport-github').Strategy;
const PORT = process.env.PORT || 8080;


/*================================PASSPORT GITHUB=================================================*/
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  /*  console.log(user);*/
  console.log('serialize', user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


//requiring our models for syncing
const db = require("./models");

// Passport Github
passport.use(new GitHubStrategy({
    clientID: "a9236c2bd104aff0b72e",
    clientSecret: "1cd8b65feef743409d63c189915b2b76bc415a70",
    callbackURL: "http://127.0.0.1:8080/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
      db.Users.findOrCreate({
          where: {
              githubId: profile.id
          },
          defaults: {
              name: profile.displayName,
              accessToken: accessToken,
              username: profile.username,
              profileUrl: profile.profileUrl,
              email: profile.emails[0].value,
              photo: profile.photos[0].value
          }
      }).then(function(user, created) {
          db.Users.update({
              accessToken: accessToken
          }, {
              where: {githubId: user.githubId}
          }).then(function (data) {
              // FIND UPDATED USER AND RETURN IT TO PASSPORT
              db.Users.findOne({
                  where: {
                      githubId: profile.id
                  }
              }).then(function (updatedUser) {
                  /*console.log("updated user", updatedUser);*/
                  return done(null, updatedUser);
              });
          })
      })
    }
));

/*================================PASSPORT GITHUB END=================================================*/

/*===============================CONFIGURE EXPRESS================================================*/
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

// Serve static content for the app from the "app" directory
app.use(express.static(__dirname + "/app"));

// Morgan and body-parser
app.use(logger("dev"));
app.use(bodyParser.urlencoded({'extended':'false'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override'));

//require passport and GitHub api routesroutes
require('./routes/passport-routes.js')(app);



//syncing our sequelize models then starting our express app.  
//Use force:true after models have been altered or first running the app on a local machine
db.sequelize.sync({/*force: true*/}).then(function() {
    app.listen(PORT, function() {
        console.log("listening on http://localhost:" + PORT);
    });
});



