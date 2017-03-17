var db = require('./../models');
var Users = require('./../models/user.js');

module.exports = function(app) {
	app.get('/login/github', function(req, res){
		db.Users.findAll({})
				.then(function(data){
					console.log(data);
					res.json(data);
				});
	});


};