'use strict' 

const Strategy = require('passport-reddit').Strategy;

module.exports = {

  RedditStrategy: new Strategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: process.env.callbackURL
  },
    function(accessToken, refreshToken, profile, done) {
      return done(null, {
        accessToken,
        refreshToken,
        profile
      })
    }
),
  
  serializeUser (user, done) {
    done(null, user);
  },

  deserializeUser (obj, done) {
    done(null, obj);
  }
}