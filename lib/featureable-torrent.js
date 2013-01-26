/*
 * featureable-torrent
 * https://github.com/pwmckenna/featureable-torrent
 *
 * Copyright (c) 2013 Patrick Williams
 * Licensed under the MIT license.
 */

var express = require('express');
var Firebase = require('./firebase-node');
var app = express();
var util = require('./util');
var FirebaseTokenGenerator = require("./firebase-token-generator-node.js");

if(!process.env.FIREBASE_SECRET) {
	console.error('FIREBASE_SECRET not available in the current environment');
	process.exit(1);
}

var tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_SECRET);
var token = tokenGenerator.createToken({}, {
    admin: true
});
var firebase = new Firebase('https://featuredcontent.firebaseio.com/');

var onAnnounceRequest = function(req, res) {
	var query = req.query;

	if(!req.query.hasOwnProperty('info_hash')) {
		console.error('received an announce with an info hash');
		res.writeHead(400);
		res.end();
		return;
	}

	if(query.hasOwnProperty('event') && query['event'] === 'completed') {
		var info_hash = util.uri2Hex(req.query['info_hash']);
		var trackerId = req.params.trackerId;
		console.log('completed event');

		var tracker = firebase.child('trackers').child(trackerId);
		tracker.once('value', function(dataSnapshot) {
			var value = dataSnapshot.val();
			console.log('tracker value', value);
			if(value.info_hash.toUpperCase() !== info_hash.toUpperCase()) {
				console.error('mismatch info hashes', info_hash, value.info_hash);
				return;
			}

			var completed = value.completed + 1;
			var size = req.query['downloaded'];
			tracker.update({
				'completed': completed,
				'size': size
			});
		});
	} else {
		console.log('non completed tracker announce');
	}

	res.writeHead(200);
	res.end('d8:intervali60e5:peerslee');
};

var onScrapeRequest = function(req, res) {
	res.writeHead(200);
	res.end('de');
};

app.get('/:trackerId/announce', onAnnounceRequest);
app.get('/:trackerId/scrape', onScrapeRequest);

var port = process.env.PORT || 5000;
var onAuth = function(success) {
	if(success) {
		console.log('firebase login success');
		app.listen(port, function() {
		    console.log('Listening on ' + port);
		});
	} else {
		console.log('firebase login failure');
		process.exit(1);
	}
};
firebase.auth(token, onAuth);
