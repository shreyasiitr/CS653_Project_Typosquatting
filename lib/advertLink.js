/**
 * Taken an array of links and return an array that has only advertisements links
 * @param array
 * @param callback
 */
var getAdverts = require('./getAdvertisements');

var advertLink = function(array, callback) {
    getAdverts(function(error, advertArray){
    	var result = [];
    	for (var i = 0; i < array.length; i++) {
            var check = 0;
            for (var j = 0; j < advertArray.length; j++) {
                if(advertArray[j]==array[i]){
                    check = 1;
                    break;
                }
            }
            if(check===1){
                result.push(array[i]);
            }
    	}
    	callback(null,result);
    });
};

module.exports = advertLink;
