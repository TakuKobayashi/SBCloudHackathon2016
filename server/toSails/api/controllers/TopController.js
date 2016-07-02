/**
 * TopController
 *
 * @description :: Server-side logic for managing tops
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var WebSocketServer = require('ws').Server;

module.exports = {
  index: function (req,res) {
    res.view("top");
  }
};

