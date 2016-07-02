var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

module.exports = {
  index: function (req,res) {
  	var protocol = req.connection.encrypted?'https':'http';
    var redirectUrl = protocol + '://' + req.headers.host + '/googleauth';
    var auth = new googleAuth();
    var googleApiInfo = sails.config.apiconfig.google;
    var oauth2Client = new auth.OAuth2(googleApiInfo.clientId, googleApiInfo.clientSecret, redirectUrl);
    getNewToken(oauth2Client, function(auth){
      console.log(auth);
    });

    res.view("top");
  },

  googleauth: function (req,res) {
    return res.redirect('/top');
  },
};

var getNewToken = function(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      console.log(token);
      callback(oauth2Client);
    });
  });
}

