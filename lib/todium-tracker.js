/*
 * featureable-torrent
 * https://github.com/pwmckenna/featureable-torrent
 *
 * Copyright (c) 2013 Patrick Williams
 * Licensed under the MIT license.
 */

var express = require('express');
var app = express();
var util = require('./util');
var Firebase = require('firebase');
var firebase = new Firebase('https://todium.firebaseio.com/');
var assert = require('assert');

var onAnnounceRequest = function(req, res) {
	var query = req.query;
	console.log(query);
	var time = new Date();

	if(!req.query.hasOwnProperty('info_hash')) {
		console.error('received an announce without an info hash');
		res.writeHead(400);
		res.end();
		return;
	}
	if(req.query.hasOwnProperty('event')) {
		console.log('EVENT', req.query['event']);
	}
	var info_hash = util.uri2Hex(req.query['info_hash']);
	console.log('announce', info_hash);

	if(query.hasOwnProperty('event')) {
		var ev = query['event'];
		var trackerId = req.params.trackerId;

		// Track all events globally
		var value = {
			time: time.toString(),
			uploaded: req.query.hasOwnProperty('uploaded') ? parseInt(req.query['uploaded']) : null,
			downloaded: req.query.hasOwnProperty('downloaded') ? parseInt(req.query['downloaded']) : null,
			left: req.query.hasOwnProperty('left') ? parseInt(req.query['left']) : null,
		};

		firebase.child('stats').child(ev).push().setWithPriority(value, time.getTime());

		var tracker = firebase.child('trackers').child(trackerId);
		tracker.child('info_hash').once('value', function(dataSnapshot) {
			var data = dataSnapshot.val();
			if(!data) {
				return;
			}
			if(data.toUpperCase() !== info_hash.toUpperCase()) {
				console.error('mismatch info hashes', info_hash, value.info_hash);
				return;
			}

			// Track the events specific to the torrent
			tracker.child('stats').child(ev).push().setWithPriority(value, time.getTime());
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
app.listen(port, function() {
    console.log('Listening on ' + port);
});