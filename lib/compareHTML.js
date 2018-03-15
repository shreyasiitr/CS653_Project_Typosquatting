var htmlToJson = require('htm-to-json');
var diff = require('deep-diff').diff;

var compareHTML = function (html1, html2, callback) {
    htmlToJson.convert_html_to_json(html1, function (err, json1) {
        if (err) return callback(err);
        else {
            htmlToJson.convert_html_to_json(html2, function (err, json2) {
                if (err) return callback(err);
                else {
                    var len;
                    if(json2) {
                        len = Object.keys(json2).length;
                    }
                    return callback(null, diff(json1, json2), len);
                }
            });
        }
    });
};

var convert_html_to_json = function (htmlStr, callback) {
    var error;
    try {
        var jsn = {};
        var len = htmlStr.length || 0;
        var str = htmlStr || "";
        var pos = 0;
        for (var j = pos; j < len; j++) {
            if (str.charAt(j) == '<' && str.charAt(j + 1) != '/' && str.charAt(j + 1) != '!') {
                var tagLine = "";
                for (var k = ++j; k < len; k++) {
                    if (str.charAt(k) == ">") {
                        //console.log(tagLine);
                        var _tagNameList = tagLine && tagLine.trim().split(' ');
                        var _tagRootName = _tagNameList[0], _tagValue = "";
                        if (!jsn.hasOwnProperty(_tagRootName))
                            jsn[_tagRootName] = [];
                        if (_tagNameList.length > 1) {
                            var _tagAttr = _tagNameList.slice(1, _tagNameList.length);
                            var _tagAttrStr = _tagAttr.join(' ');
                            var _tagAttrJsn = {}, tokenId = "", tokenVal = "";
                            //console.log(_tagAttrStr);
                            for (var s = 0; s < _tagAttrStr.length; s++) {
                                if (_tagAttrStr.charAt(s) != " " && _tagAttrStr.charAt(s) != "=")
                                    tokenId += _tagAttrStr.charAt(s);
                                if (_tagAttrStr.charAt(s) == "=") {
                                    var _checkAttrEnd = "";
                                    for (var p = ++s; p < _tagAttrStr.length; p++) {
                                        if (p == s) {
                                            var _trimStr = _tagAttrStr.substring(p, _tagAttrStr.length);
                                            _trimStr = _trimStr && _trimStr.trim();
                                            if (_trimStr.charAt(0) == "'")
                                                _checkAttrEnd = "'";
                                            else if (_trimStr.charAt(0) == '"')
                                                _checkAttrEnd = '"';
                                            else
                                                _checkAttrEnd = " ";

                                        }

                                        if (_tagAttrStr.charAt(p) != "'" && _tagAttrStr.charAt(p) != '"' && _tagAttrStr.charAt(p) != _checkAttrEnd) {
                                            tokenVal += _tagAttrStr.charAt(p);
                                        }

                                        if ((tokenVal.length != 0 && _tagAttrStr.charAt(p) == _checkAttrEnd) || p == _tagAttrStr.length - 1) {
                                            _tagAttrJsn[tokenId] = tokenVal;
                                            tokenId = "";
                                            tokenVal = "";
                                            s = p;
                                            break;
                                        }
                                    }
                                }
                            }
                            //get innerHTML
                            if (_tagRootName && _tagRootName.trim() != "script" && _tagRootName.trim() != "style")
                                for (var v = k + 1; v < len; v++) {
                                    if (str.charAt(v) == "<") {
                                        if (_tagValue.length != 0)
                                            _tagAttrJsn['innerHTML'] = _tagValue;
                                        v = len;
                                    }
                                    else
                                        _tagValue += str.charAt(v);
                                }
                            jsn[_tagRootName].push(_tagAttrJsn);
                            break;
                        }
                        else {
                            //get innerHTML
                            if (_tagRootName && _tagRootName.trim() != "script" && _tagRootName.trim() != "style")
                                for (var v = k + 1; v < len; v++) {
                                    if (str.charAt(v) == "<") {
                                        if (_tagValue.length != 0) {
                                            if (jsn[_tagRootName].length != 0)
                                                jsn[_tagRootName][jsn[_tagRootName].length - 1]['innerHTML'] = _tagValue;
                                            else
                                                jsn[_tagRootName].push({'innerHTML': _tagValue});
                                        }
                                        v = len;
                                    }
                                    else
                                        _tagValue += str.charAt(v);
                                }
                            j = k;
                            break;
                        }

                    }
                    else {
                        tagLine += str.charAt(k);
                    }
                }
            }
        }
    } catch (err) {
        error = err;
    }
    callback(error, jsn);
};

module.exports = compareHTML;
