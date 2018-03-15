var http = require('http');
var request = require('request');
var URL = require('url');
var redirected;
var redirects_number = 0;

var getOptions = function (hostname) {
    var url = URL.parse(hostname);
    return {
        url: url.protocol + '//' + url.hostname,
        headers: {
            // set user agent for good measure
            'User-Agent': 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405'
            // linux user agent does not work
            //'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0'
        },
        path: url.path,
        method: 'GET',
        followRedirect: false,
        timeout: 10000
    };
};

var requestWrapper = function (options, callback) {
    console.log(new Date());
    console.log(options);  
    var timeoutFlag = 0;
    /*setTimeout(function() {
	if(timeoutFlag == 0) {
		timeoutFlag = 1;
		console.log('Timeout!');
		return callback(new Error('scraper.js: timeout forced'));
	}
	console.log('Timeout flag is:'+timeoutFlag);
	return;
   }, 30000);*/
    request(options, function (err, res) {
	console.log('inside request callback');
	/*if (timeoutFlag==1) {
		console.log('timeout flag=1');
		return;
	}
	else timeoutFlag = 2;*/
        if (err) {
	    // console.log('timeout flag=2');
            return callback(err);
        }
        else {
            if (res.statusCode == 301 || res.statusCode == 302) {
                var url = URL.parse(res.headers.location);
		console.log(url);
		if(!res.headers.location) return callback(new Error('scraper.js: Cannot url empty'));
                if (!url.hostname) {
                    url = URL.parse(options.url);
                    if (res.headers.location[0] === '/') {
                        redirected = url.href + res.headers.location.slice(1);
                    }
                    else {
                        redirected = url.href + res.headers.location;
                    }
                }
                else {
                    redirected = res.headers.location;
                }
                redirects_number++;
                if (redirects_number <= 10) {
                    return requestWrapper(getOptions(redirected), callback);
                }
                else {
                    return callback(new Error('Redirect limit exceeded'));
                }
            }
            if(res.statusCode[0] == 4 || res.statusCode[0] == 5) {
                return callback(null, null, false);
            }
            else if(res.statusCode == 200) {
                if (res.body) {
                    return callback(null, res.body, true);
                }
                else {
                    return callback(null, null, true);
                }
            }
            return callback(null, null, false);
        }
    });
};

var scraper = function (hostname, callback) {
    var options = getOptions(hostname);
    requestWrapper(options, function (err, body, status) {
        if (err) {
            return callback(err);
        }
        else {
            return callback(null, body, redirected, status);
        }
    });
};

module.exports = scraper;
