'use strict';
var
	express	= require('express'),
	app		= express();

app.set('views', __dirname + '/static');
app.use(express.static(__dirname + '/static'));
app.set('view engine', 'jade');

// index.html
app.get('/', function (req, res) {
	res.render('index');
});

// event.js
app.get('/advancedPubSub.js', function (req, res) {
	res.sendFile(__dirname + '/advancedPubSub.js');
});
app.get('/advancedPubSubOpt.js', function (req, res) {
	res.sendFile(__dirname + '/advancedPubSubOpt.js');
});

app.listen(3000);