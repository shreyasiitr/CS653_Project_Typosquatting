var DNS = require('dns');

var dnsResolve = function(hostname, callback) {
    DNS.resolveNaptr(hostname, callback);
};

var dnsReverse = function(ip, callback) {
    DNS.reverse(ip, callback);
};

exports.dnsReverse = dnsReverse;
exports.dnsResolve = dnsResolve;
