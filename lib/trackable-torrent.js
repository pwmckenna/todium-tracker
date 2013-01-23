/*
 * trackabletorrent
 * https://github.com/pwmckenna/trackabletorrent
 *
 * Copyright (c) 2013 Patrick Williams
 * Licensed under the MIT license.
 */

var express = require('express');
var app = express();

app.get('/:user/announce', function(req, res) {
	console.log('announce', req.query);
	console.log(req.query.info_hash.length)
	res.end();
});

app.get('/:user/scrape', function(req, res) {
	console.log('scrape', req.query)
	res.end();
});

app.listen(3000);