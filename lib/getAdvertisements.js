var http = require('https');
var fs = require('fs');

var link = "https://pgl.yoyo.org/as/serverlist.php?showintro=0;hostformat=hosts";
var adverts = [];

//Makes a GET request to the site storing the ad domains and writes the data received locally
var advert = function(hostname, callback) {
    var content = "";
    http.get(hostname, function(res) {
        res.setEncoding("utf8");
        res.on('data', function (chunk) {
            content += chunk;
            
        });
        res.on('end', function () {
            fs.writeFile('advertisements.txt', content, 'utf-8', function(err){
              if (err) throw err;
              callback(null, 'advertisements.txt');
            });
        });
        res.on('error', function(error) {
            console.log("error");
        });
    });
};

//Parses the locally saved file containing the ad domains and passes this array to the callback
var getAdverts = function(callback){
    advert(link,function(error, filename){
        fs.readFile(filename, 'utf-8', function(err, data) {
            if (err) throw err;
            var index = data.indexOf('127.0.0.1');
            while(index!=-1){
                var advertLink = "";
                var counter = index + 9;
                while(data[counter]==" "){
                    counter++;
                }
                var start = counter;
                while(data[counter]!=" " && data[counter]!="\n"){
                    counter++;
                }
                advertLink = data.substr(start, counter-start);
                adverts.push(advertLink);
                var newIndex = index+9;
                index = data.indexOf('127.0.0.1', newIndex);
            }
            callback(null, adverts);
        });
    });
}

module.exports = getAdverts;
