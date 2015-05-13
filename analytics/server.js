var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var Event = require('./server/models/event.js');


var app = express();


//enable CORS
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname+'/public'));

app.use(function(req,res,next){
	next();
});
app.get('/analytics.js', function (req, res) {
  res.sendFile(__dirname+'/analytics.js');
});


app.post('/ping', function (req, res, next) {

	//received the analytics information
	Event.create(req.body,function(err,data){
		if(err) return next(err);
		else{
			console.log(data);
			res.send(200);

		}
	});
	});
var server = app.listen(1338, function () {

var host = server.address().address;
var port = server.address().port;

  console.log('listening........', host, port);

});