"use strict";

var http = require('http'),
	querystring = require('querystring'),
	Hashes = require('jshashes');

exports.SYW = function(appId, appSecret, isSandbox) {
	this.userState = function(token, callback) {
		callEndpoint('/auth/user-state', null, token, callback);
	};

	this.currentUser = function(token, callback) {
		callEndpoint('/users/current', null, token, callback);
	};

	this.getOfflineToken = function(userId, token, callback) { //permissions: OfflineAccess
		var now = new Date();
		var query = {
			userId: userId,
			appId: appId,
			timestamp: getDateTimeStr(now),
			signature: generateHash(userId + appId + getDateTimeUnix(now) + appSecret)
		};
		callEndpoint('/auth/get-token', query, token, callback);
	};

	this.createCatalog = function(name, description, privacy, token, callback) { //permissions: CreateCatalogs
		var query = {
			name: name,
			description: description,
			privacy: privacy
		};
		callEndpoint('/catalogs/create', query, token, callback);
	};

	this.addCatalogAppItem = function(catalogId, title, relativeUrl, imageUrl, token, callback) { //permissions: ManageCatalogItems
		var query = {
			catalogIds: [ catalogId ],
			title: title,
			url: relativeUrl,
			imageUrl: imageUrl
		};
		callEndpoint('/catalogs/items/add/app-item', query, token, callback);
	};

	function callEndpoint(endpoint, query, token, callback) {
		query = query || {};
		query.token = token;
		query.hash = generateAuthHash(token);
		var path = endpoint + getQueryString(query);

		var options = {
			host: isSandbox ? 'sandboxplatform.shopyourway.com' : 'platform.shopyourway.com',
			port: 80,
			path: path
		};

		http.get(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', callback);
		});
	}

	function generateAuthHash(token) {
		return generateHash(token + appSecret);
	}

	function generateHash(str) {
		return new Hashes.SHA256().hex(str);
	}

	function getDateTimeStr(date) {
		return date.getUTCFullYear() +
			'-' + pad( date.getUTCMonth() + 1 ) +
			'-' + pad( date.getUTCDate() ) +
			'T' + pad( date.getUTCHours() ) +
			':' + pad( date.getUTCMinutes() ) +
			':' + pad( date.getUTCSeconds() );
	}

	function getDateTimeUnix(date) {
		var val = Math.floor(date.getTime() / 1000);
		return val.toString();
	}

	function pad(number) {
		var r = String(number);
		if ( r.length === 1 ) {
			r = '0' + r;
		}
		return r;
	}

	function getQueryString(query) {
		return '?' + querystring.stringify(query).replace(/%3A/g,':');
	}
};