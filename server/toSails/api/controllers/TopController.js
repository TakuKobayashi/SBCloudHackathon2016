var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

var getAuth2Client = function(req){
  var protocol = req.connection.encrypted?'https':'http';
  var redirectUrl = protocol + '://' + req.headers.host + '/googleauth';
  var auth = new googleAuth();
  var googleApiInfo = sails.config.apiconfig.google;
  return new auth.OAuth2(googleApiInfo.clientId, googleApiInfo.clientSecret, redirectUrl);
}

var createUser = function(res,callback){
  var uuid = require('node-uuid');
  var token = uuid.v4();
  User.create({token: token}).exec(function(err, user){
    res.cookie(host, user.token);
    callback(user);
  });
}

var googleAuth = function(req, user, oauth2Client){
  if(!user.googleAccessToken){
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    req.redirect(authUrl);
  }
}

module.exports = {
  index: function (req,res) {
    var oauth2Client = getAuth2Client(req);
    var host = req.headers.host;

    if(req.cookies[host]){
      User.findOne({token: req.cookies[host]}).exec(function(err, user){
        if(user){
        }else{
          createUser(res, function(user){
          	googleAuth(req, user, oauth2Client);
            res.view("top");
          });
        }
      });
    }else{
      createUser(res, function(user){
      	googleAuth(req, user, oauth2Client);
        res.view("top");
      });
    }
    console.log(req.cookies[host]);
  },

  googleauth: function (req,res) {
    console.log(req.params);
    return res.redirect('http://47.88.138.17:1337/top');
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