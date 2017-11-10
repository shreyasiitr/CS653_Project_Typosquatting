var typos = function(){
	var word = process.argv[2];
	var splits = [];
	var obj1 = {"":word};
	console.log(obj1);
	var obj2 = {};
	obj2[word] = "";
	splits.push(obj1);
	splits.push(obj2);
	for(var i = 1; i<word.length; i++){
		var second = word.substr(i);
		var first = word.substr(0,i);
		var obj = {};
		obj[first]=second;
		splits.push(obj);
	}
	return splits;
}

var deleteOne = function(splits){
	var deletesArray = [];
	for (var i = 0; i < splits.length; i++) {
		for(var key in splits[i]){
			if(splits[i][key].length>0){
				var temp = splits[i][key].substr(1);
				temp = key + temp;
				deletesArray.push(temp);
			}
		}
	}
	console.log(deletesArray);
	return deletesArray;
}

var transpose = function(splits){
	var transposeArray = [];
	for (var i = 0; i < splits.length; i++) {
		for(var key in splits[i]){
			if(splits[i][key].length>1){
				var temp1 = splits[i][key][0];
				var temp2 = splits[i][key][1];
				var temp = key + temp2 + temp1 + splits[i][key].substr(2);
				transposeArray.push(temp);
			}
		}
	}
	console.log(transposeArray);
	return transposeArray;
}

var replace = function(splits){
	var alpha = "abcdefghijklmnopqrstuvwxyz";
	var replaceArray = [];
	for (var i = 0; i < splits.length; i++) {
		for(var key in splits[i]){
			if(splits[i][key].length>0){
				for(var j = 0; j<alpha.length; j++){
					var temp = key + alpha[j] + splits[i][key].substr(1);
					replaceArray.push(temp);
				}
			}
		}
	}
	console.log(replaceArray);
	return replaceArray;
}

var insert = function(splits){
	var alpha = "abcdefghijklmnopqrstuvwxyz";
	var insertArray = [];
	for (var i = 0; i < splits.length; i++) {
		for(var key in splits[i]){
			if(splits[i][key].length>0){
				for (var j = 0; j < alpha.length; j++) {
					var temp = key + alpha[j] splits[j][key];
					insertArray.push(temp);
				}
			}
		}
	}
	console.log(insertArray);
	return insertArray;
}



