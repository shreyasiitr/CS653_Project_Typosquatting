var urllib = require('url');
//Store the part of the link that contains .com, .edu etc onwards
var remainingLink = "";

//Returns the array of objects in which the key is the first part of the hostname and the value is the remaining string
var typos = function (url) {
    var word = urllib.parse(url).hostname.split('.')[0];
    remainingLink = urllib.parse(url).hostname.split('.').slice(1).toString().replace(',','.');
    var splits = [];
    var obj1 = {"": word};
    var obj2 = {};
    obj2[word] = "";
    splits.push(obj1);
    splits.push(obj2);
    for (var i = 1; i < word.length; i++) {
        var second = word.substr(i);
        var first = word.substr(0, i);
        var obj = {};
        obj[first] = second;
        splits.push(obj);
    }
    return splits;
};

//Returns all possible hostnames when one character is deleted from the original one
var deleteOne = function (splits) {
    var deletesArray = [];
    for (var i = 0; i < splits.length; i++) {
        for (var key in splits[i]) {
            if (splits[i][key].length > 0) {
                var temp = splits[i][key].substr(1);
                temp = key + temp;
                deletesArray.push(temp);
            }
        }
    }
    return deletesArray;
};

//Returns all possible hostnames when two adjacent characters are interchanged in the original one
var transpose = function (splits) {
    var transposeArray = [];
    for (var i = 0; i < splits.length; i++) {
        for (var key in splits[i]) {
            if (splits[i][key].length > 1) {
                var temp1 = splits[i][key][0];
                var temp2 = splits[i][key][1];
                var temp = key + temp2 + temp1 + splits[i][key].substr(2);
                transposeArray.push(temp);
            }
        }
    }
    return transposeArray;
};

//Returns all possible hostnames when one character in the original one is replaced with another one of the 25 characters
var replace = function (splits) {
    var alpha = "abcdefghijklmnopqrstuvwxyz";
    var replaceArray = [];
    for (var i = 0; i < splits.length; i++) {
        for (var key in splits[i]) {
            if (splits[i][key].length > 0) {
                for (var j = 0; j < alpha.length; j++) {
                    var temp = key + alpha[j] + splits[i][key].substr(1);
                    replaceArray.push(temp);
                }
            }
        }
    }
    return replaceArray;
};

var insert = function (splits) {
//Returns all possible hostnames when one character is inserted in the original one.
    var alpha = "abcdefghijklmnopqrstuvwxyz";
    var insertArray = [];
    for (var i = 0; i < splits.length; i++) {
        for (var key in splits[i]) {
            if (splits[i][key].length > 0) {
                for (var j = 0; j < alpha.length; j++) {
                    var temp = key + alpha[j] + splits[i][key];
                    insertArray.push(temp);
                }
            }
        }
    }
    return insertArray;
};

/**
 * Wrapper function.
 * Return an array that consists of all the typo squatted urls for the given url.
 * @param url
 */
var typoSquat = function(url) {
    var result = [];
    var splitsArray = typos(url);
    var deleteArray = deleteOne(splitsArray);
    var transposeArray = transpose(splitsArray);
    var replaceArray = replace(splitsArray);
    // var insertArray = insert(splitsArray);
    result = deleteArray.concat(transposeArray).concat(replaceArray);
    for (var i = 0; i < result.length; i++) {
        result[i] = 'http://'+result[i]+'.'+remainingLink + '/';
    }
    
    return result;
};

module.exports = typoSquat;
