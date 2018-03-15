API_KEY = 'AIzaSyBCv6fMsFxIxNgvaPloVX_yolh0oS7cE5w';
var request = require('request');

/**
 * send an array of urls to make the body
 * @param array
 */
var makeBody = function(array) {
    var body = {
        "threatInfo": {
            "threatEntries": []
        }
    };
    array.forEach(function(url) {
        body['threatInfo']['threatEntries'].push({'url':url})
    });
    return JSON.stringify(body);
};

/**
 * Array of urls to check for the malware. Returns an array with the urls for malware detected.
 * @param array
 * @param callback
 */
var malwareUrl = function(array, callback) {
    if(array) {
        if(array.length) {

            var body = makeBody(array);
            request({
                'method': 'POST',
                'url': 'http://localhost:8080/v4/threatMatches:find',
                'body': body,
                'headers': {
                    'Content-Type': 'application/json'
                }
            }, function(err, res) {
                if (err) {
                    callback(err);
                }
                else {
                    var resp = res.body;
                    resp = JSON.parse(resp);
                    var toReturn = [];
                    if(resp['matches']) {
                        resp['matches'].forEach(function(item) {
                            if(item['threatType'] === 'MALWARE') {
                                toReturn.push(item['threat'].url);
                            }
                        });
                    }
                    callback(null, toReturn);
                }
            });
        }
        else {
            callback(null, []);
        }
    }
    else {
        callback(null, []);
    }
};

module.exports = malwareUrl;
