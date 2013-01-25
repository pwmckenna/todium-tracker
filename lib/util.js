module.exports = {
	uri2Hex: function(uri) {
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
}