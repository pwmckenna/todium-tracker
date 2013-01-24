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

var FirebaseTokenGenerator = require("./firebase-token-generator-node.js");
var tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_SECRET);
var token = tokenGenerator.createToken({}, {
    admin: true
});

var firebase = new Firebase('https://featuredcontent.firebaseio.com/');
firebase.auth(token, function(success) {
	if(success) {
		console.log('firebase login success');
	} else {
		console.log('firebase login failure');
	}
});

var uri2Hex = function(uri) {
	var hex = '';
	var next = 0;
	while(next < uri.length) {
		if(uri[next] === '%') {
			++next;
			hex += uri[next++];
			hex += uri[next++];
		} else {
			hex += uri.charCodeAt(next++).toString(16);
		}
	}
	return hex;
}

app.get('/:user', function(req, res) {
	var has_info_hash = req.query.hasOwnProperty('info_hash');
	var has_peer_id = req.query.hasOwnProperty('peer_id');

	if(!has_info_hash || !has_peer_id) {
		res.writeHead(400);
		res.end();
		return;
	}

	var info_hash = uri2Hex(req.query['info_hash']);
	var peer_id = uri2Hex(req.query['peer_id']);
	res.writeHead(200);
	res.end('d8:intervali60e5:peerslee');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log('Listening on ' + port);
});