var fs = require('fs'); 
var parse = require('csv-parse');

//CSV file that contains Alexa top 1,000,000 hostnames
var inputFile='top-1m.csv';
var adLinks=[];

//Parses the CSV file and passes the proper URL's to the callback
var csvParser = function(callback){
	fs.createReadStream(inputFile)
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
        var prefix = 'http://';
        var link = prefix + csvrow[1];
        adLinks.push(link);      
    })
    .on('end',function() {
    	callback(null,adLinks);
    });
};

module.exports = csvParser;
