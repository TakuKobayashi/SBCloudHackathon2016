module.exports = function(grunt) {
  grunt.registerTask('crawldata', function(){
    console.log("hello");
    var done = this.async();
    console.log(done);
    console.log(this);

    var sails = require('sails');
    sails.load(function(err, sails) {
      console.log("hello");
      console.log(sails);
      done();
    });
  });
};