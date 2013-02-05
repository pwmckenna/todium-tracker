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
		console.error('received an announce without an info hash');
		res.writeHead(400);
		res.end();
		return;
	}
	if(req.query.hasOwnProperty('event')) {
		console.log('EVENT', req.query['event']);
	}
	var downloaded = parseInt(req.query['downloaded']);
	var info_hash = util.uri2Hex(req.query['info_hash']);
	console.log('announce', info_hash, downloaded);

	if(query.hasOwnProperty('event')) {
		var ev = query['event'];
		var trackerId = req.params.trackerId;
		console.log('completed event');

		var tracker = firebase.child('trackers').child(trackerId);
		tracker.child('info_hash').once('value', function(dataSnapshot) {
			if(dataSnapshot.val().toUpperCase() !== info_hash.toUpperCase()) {
				console.error('mismatch info hashes', info_hash, value.info_hash);
				return;
			}

			//increment the number of times this torrent has been downloaded
			tracker.child(ev).transaction(function(current) {
				if(!current) {
					return 1;
				}
				return current + 1;
			});

			if(query[ev] === 'completed') {
				//add to the total amount of data transferred on behalf of this torrent
				tracker.child('transferred').transaction(function(current) {
					return current + downloaded;
				});

				//update the global amount transferred...track this by day
				var date = (new Date()).toLocaleDateString();
				firebase.child('transferred').child(date).transaction(function(current) {
					console.log('transaction', current);
					return current + downloaded;
				});
			} else {
				console.log('non complete event tracker announce');
			}
		});
	} else {
		console.log('non event tracker announce');
	}

	res.writeHead(200);
	res.end('d8:intervali3600e5:peerslee');
};

var onScrapeRequest = function(req, res) {
	res.writeHead(200);
	res.end('de');
};

app.get('/:trackerId/announce', onAnnounceRequest);
app.get('/:trackerId/scrape', onScrapeRequest);

var port = process.env.PORT || 5000;
var onAuth = function(error, dummy) {
	if(!error) {
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
