var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

var getAuth2Client = function(req){
  var protocol = req.connection.encrypted?'https':'http';
  var redirectUrl = 'http://taptappun.cloudapp.net:1337/top/googleauth';
  var auth = new googleAuth();
  var googleApiInfo = sails.config.apiconfig.google;
  return new auth.OAuth2(googleApiInfo.clientId, googleApiInfo.clientSecret, redirectUrl);
}

var getUser = function(req, res,callback){
  var host = req.headers.host;
  var createUser = function(r, cb){
  	var uuid = require('node-uuid');
    var token = uuid.v4();
    if(req.cookies[host]){
      token = req.cookies[host];
    }
    User.create({token: token}).exec(function(err, user){
      r.cookie(host, user.token);
      cb(user);
    });
  }
  if(req.cookies[host]){
    User.findOne({token: req.cookies[host]}).exec(function(err, user){
      if(user){
        callback(user);
      }else{
        createUser(res, callback);
      }
    });
  }else{
    createUser(res, callback);
  }
}

var googleAuthenticate = function(res, user, oauth2Client){
  if(!user.googleAccessToken){
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    res.redirect(authUrl);
    return true;
  }
  return false;
}

module.exports = {
  index: function (req,res) {
    var oauth2Client = getAuth2Client(req);
    getUser(req, res, function(user){
      if(!googleAuthenticate(res, user, oauth2Client)){
        res.view("top");
      }
    });
  },

  lot: function (req,res) {
    var oauth2Client = getAuth2Client(req);
    getUser(req, res, function(user){
      oauth2Client.credentials = JSON.parse(user.googleAccessToken);
      listEvents(oauth2Client, function(schedules){
        var events = schedules.items;
        var currentEvents = [];
        var now = new Date();
        for (var i = 0; i < events.length; i++) {
          var event = events[i];
          var start = event.start.dateTime || event.start.date;
          var end = event.end.dateTime || event.end.date;
          if(Date.parse(start) < now.getTime() && now.getTime() < Date.parse(end)){
            currentEvents.push(event);
          }
        }
        var request = require('request');
        var apiKey = sails.config.apiconfig.google.apiKey;
        var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=35.641463,139.698171&radius=5000&types=food&sensor=false&language=ja&key=' + apiKey;
        request(url, function (error, response, body) {
          var parsedJson = JSON.parse(body);
          res.json(parsedJson);
          if (!error && response.statusCode == 200) {
            console.log(JSON.parse(body).name);
          } else {
            console.log('error: '+ response.statusCode);
          }
        })
      });
    });
  },

  googleauth: function (req,res) {
    console.log(req.param("code"));
    return res.redirect('http://47.88.138.17:1337/top/redirectauth?code=' + req.param("code"));
  },

  redirectauth: function (req,res) {
    var oauth2Client = getAuth2Client(req);
    getUser(req, res, function(user){
      oauth2Client.getToken(req.param("code"), function(err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return;
        }
        User.update({id: user.id},{googleAccessToken: JSON.stringify(token)}, function(err, user) {
          console.log(user);
          res.redirect('/top');
        });
      });
    })
  },
};

var listEvents = function(auth, callback) {
  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: auth,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    callback(response);
  });
}