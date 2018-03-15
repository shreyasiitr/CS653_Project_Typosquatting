var compareHTML = require('../lib/compareHTML');
var checkForLink = require('../lib/checkForLink');
var dnsResolve = require('../lib/dnsHandlers').dnsResolve;
var dnsReverse = require('../lib/dnsHandlers').dnsReverse;
var malwareUrl = require('../lib/safeBrowsing');
var scraper = require('../lib/scraper');
var fs = require('fs');
var first = fs.readFileSync('html/first.html', 'utf8');
var second = fs.readFileSync('html/second.html', 'utf8');
var third = fs.readFileSync('html/third.html', 'utf8');

// Test the compare HTML function
compareHTML(first, second, function(err, diff) {
    console.log(arguments);
});

// Test the find hyperlinks function
checkForLink(third, ['google.com', 'test.com'], function(err, matchingHosts) {
    console.log(arguments);
});

scraper('http://fb.com', function(err, res, redirected) {
    console.log('Scraper');
    console.log(arguments);
});

// dnsResolve('google.com', function(err, ip) {
//     if(err) {
//         console.log(err);
//     }
//     else {
//         console.log('IP' + ip);
//         dnsReverse(ip[0], function(err, hostname) {
//             console.log(arguments);
//         });
//     }
// });

malwareUrl(['http://testsafebrowsing.appspot.com/apiv4/ANY_PLATFORM/MALWARE/URL/'], function(err, res) {
    console.log(arguments)
});
