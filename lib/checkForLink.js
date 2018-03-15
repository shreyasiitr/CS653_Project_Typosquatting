/**
 * Takes in a html page and returns an array with all the links present in the webpage
 */

var linkscrape = require('linkscrape');
var URL = require('url');

var convertArrayToObject = function(array) {
    var toReturn = {};
    for(var i=0; i<array.length; i++) {
        toReturn[array[i]] = true;
    }
    return toReturn;
};

/**
 *
 * @param html
 * @param hostnames
 * @param callback
 */

var checkForHyperLink = function(html, _, callback) {
    var url = null;
    var matchingHosts = [];
    var toReturn = [];
    try {
        linkscrape('http://test.com/', html, function(links) {
            links.forEach(function(link){
                url = URL.parse(link.href);
                if(url.hostname) {
                    toReturn.push(link.href);
                }

            });
            callback(null, toReturn);
        });
    }
    catch (e) {
        callback(e);
    }
};

module.exports = checkForHyperLink;
