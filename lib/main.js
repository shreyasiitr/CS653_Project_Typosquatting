var async = require('async');
var compareHTML = require('./compareHTML');
var scraper = require('./scraper');
var typos = require('./typosquatted');
var sanitize = require('./sanitizer');
var advertLinks = require('./advertLink');
var checkForLink = require('./checkForLink');
var malwareCheck = require('./safeBrowsing');
var csvParser = require('./csvParser');
var fs = require('fs');
var PATH = '/home/anuroopkuppam/typo-squatting/lib/results/';
//  '/home/satya/WebstormProjects/typo/lib/results/';
// Number of permissible differences
var DIFF_LEN = 5;
var ADVERT_LEN = 2;
var MALWARE_LEN = 10;
var SALE_LEN = 20;
var EMPTY_LEN = 10;
var ADVERT_COUNT = {};
var MALWARE_COUNT = {};
var URL = require('url');
var redirectedTo = {};

/**
 * Take in an url and return the sanitized version of it
 * @param url
 * @param callback
 */

var scrapeAndSanitize = function (url, ourl, callback) {
    console.log('SSSSSSSSSSSSSSSSSSSSSSSSS');
    console.log('inside scraperAndSanitize:'+ url+':'+ourl);
    scraper(url, function (err, html, redirected, status) {
        if (err) {
	    console.log(err);
            return callback(err);
        }
        else {
	    console.log('Before sanitize');
            var sanitized = sanitize(html);
	    console.log('After sanitize');
            return callback(null, sanitized, redirected, status);
        }
    });
};

/**
 * Compare main page html with typo squatted html
 * @param html
 * @param url
 * @param callback
 */
var checkForDifferences = function (html, typourl, originalurl, callback) {
    console.log('inside checkForDifferences');
    scrapeAndSanitize(typourl, originalurl, function (err, html2, redirected, status) {
        if (err) {
            callback(err);
        }
        else {
            try {
                var url1 = URL.parse(originalurl);
            }
            catch (e) {
                console.log('original', html, typourl);
                console.log(e);
            }
            try {
                var url2 = URL.parse(typourl);
            }
            catch (e) {
                console.log('typo', html, typourl);
                console.log(e);
            }
            if (redirected) {
                try {
                    url2 = URL.parse(redirected);
                }
                catch (e) {
                    console.log('redirected');
                    console.log(e);
                }
            }
            if (url1.hostname.split('.')[0] == url2.hostname.split('.')[0]) {
                return callback(null, null, DIFF_LEN + 100);
            }
            else {
                if (redirectedTo[redirected] === undefined) {
                    redirectedTo[redirected] = 0
                }
                redirectedTo[redirected]++;
                compareHTML(html, html2, function (err, diffs, length) {
                    if (err) {
                        if (err.toString() === 'TypeError: Parameter \'url\' must be a string, not undefined') {
                            return callback(null, diffs, length, html2, status);
                        }
                        else {
                            return callback(err);
                        }
                    }
                    else {
                        return callback(null, diffs, length, html2, status);
                    }
                });
            }
        }
    });
};

var skeleton = {
    typo: '',
    original: true, // if the untypo squatted version exists
    ads: false,
    malware: false,
    phishing: false,
    empty: false,
    sale: false,
    exists: true
};

var helper = function (url, websiteTypes, callback) {
    // scrape the main page of the non typo squatted domain
    scrapeAndSanitize(url, null,  function (err, html) {
        if (err) {
            console.log('init scraper:'+url);
            console.log(err);
            var websiteType = JSON.parse(JSON.stringify(skeleton));
            websiteType.original = false;
	    websiteType.typo = 'null';
            websiteTypes.push(websiteType);
            callback(null, websiteTypes, null);
        }
        else {
            // get all the typos
            var introduced_typos = typos(url);
	    console.log(introduced_typos);
            async.eachLimit(introduced_typos, 5, function (typo, callback) {
                async.waterfall([
                    function (callback) {
			console.log('checkForDifferences');
			console.log(typo);
                        if (html) {
                            checkForDifferences(html, typo, url, function (err, diff, length, typoHtml, status) {
                                var websiteType = JSON.parse(JSON.stringify(skeleton));
                                websiteType.typo = typo;
                                websiteType.status = status;
                                if (err) {
                                    console.log(err);
                                    if (err.code == 'ENOTFOUND') {
                                        websiteType.exists = false;
                                    }
                                    return callback(null, null, null);
                                }
                                else {
                                    if (diff) {
                                        if (diff.length <= DIFF_LEN) {
                                            console.log(typo+':'+diff.length);
                                            websiteType.phishing = true;
                                        }
                                    }
                                    if (length <= EMPTY_LEN) {
                                        websiteType.empty = true;
                                    }
                                    if (length <= SALE_LEN) {
                                        if (typoHtml.indexOf('sale') !== -1) {
                                            websiteType.sale = true;
                                        }
                                    }
                                    return callback(null, typoHtml, websiteType);
                                }
                            });
                        }
                        else {
                            return callback(null, null, null);
                        }
                    },
                    function (typoHtml, websiteType, callback) {
			console.log('checkForLink');
			console.log(typo);
                        if (typoHtml) {
                            // aggregate all the links in the html
                            checkForLink(typoHtml, '', function (err, links) {
                                if (err) {
                                    console.log(err);
                                    return callback(null, null, null, null);
                                }
                                else {
                                    return callback(null, typoHtml, links, websiteType);
                                }
                            });
                        }
                        else {
                            return callback(null, null, null, null);
                        }
                    },
                    function (typoHtml, links, websiteType, callback) {
			console.log('advertLinks');
			console.log(typo);
                        if (typoHtml) {
                            // check for advert links
                            advertLinks(links, function (err, adverts) {
                                if (err) {
                                    console.log(err);
                                    return callback(null, null, null, null);
                                }
                                else {
                                    if (adverts.length > ADVERT_LEN) {
                                        websiteType.ads = true;
                                    }
                                    adverts.forEach(function (advert) {
                                        if (ADVERT_COUNT[advert] === undefined) {
                                            ADVERT_COUNT[advert] = 0
                                        }
                                        ADVERT_COUNT[advert]++;
                                    });
                                    return callback(null, typoHtml, links, websiteType);
                                }
                            });
                        }
                        else {
                            return callback(null, null, null, null);
                        }
                    },
                    function (typoHtml, links, websiteType, callback) {
			console.log('malwareCheck');
			console.log(typo);
                        if (typoHtml) {
                            // check for malware links
                            malwareCheck(links, function (err, malwares) {
                                if (err) {
                                    console.log(err);
                                    return callback();
                                }
                                else {
                                    if (malwares.length > 0) {
                                        websiteType.malware = true;
                                    }
                                    malwares.forEach(function (malware) {
                                        if (MALWARE_COUNT[malware] === undefined) {
                                            MALWARE_COUNT[malware] = 0;
                                        }
                                        MALWARE_COUNT[malware]++;
                                    });
                                    websiteTypes.push(websiteType);
                                    return callback();
                                }
                            });
                        }
                        else {
                            return callback();
                        }
                    }
                ], callback);
            }, function (err) {
                if (err) {
			console.log(err);
                }
                return callback(null, websiteTypes);
            });
        }
    });
};

csvParser(function (_, links) {
    links = links.slice(40, 50);
    links = ['https://google.com'];
    async.eachLimit(links, 1, function (link, callback) {
        helper(link, [], function (err, results) {
            if (err) {
                console.log(err);
            }
	   console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');            
                var str = '';
                Object.keys(skeleton).forEach(function (key) {
                    str += key + ','
                });
                str += '\n';
		console.log(results);
                results.forEach(function (result) {
                    str += result['typo'] + ',';
                    str += result['original'] + ',';
                    str += result['ads'] + ',';
                    str += result['malware'] + ',';
                    str += result['phishing'] + ',';
                    str += result['empty'] + ',';
                    str += result['sale'] + ',';
                    str += result['exists'] + ',';
                    str += '\n'
                });
                var filename = PATH + URL.parse(link).hostname + '.csv';
                fs.writeFile(filename, str, 'utf-8', function (err) {
                    console.log(err);
                    callback();
                });
        });
    }, function(err) {
        console.log(err);
        console.log(ADVERT_COUNT);
        console.log(MALWARE_COUNT);
    });
});
