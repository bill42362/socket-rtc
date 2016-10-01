'use strict'
const MersenneTwister = require('mersenne-twister');

if(undefined === window.Core) { window.Core = function() {}; };
Core.object = function() {
	return this;
}; Core.object.prototype = Core.prototype;

Core.random = Math.random;
if(window.MersenneTwister) {
    Core.mersenneTwister = new MersenneTwister();
    Core.random = function() { return Core.mersenneTwister.random_long(); }
}

Core.getCookieByName = function(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie != '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) == (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

Core.ajax = function(url, method = 'get', data = {}, success, error) {
    let responseAJAX = function() {
        if(httpRequest.readyState === XMLHttpRequest.DONE) {
            if(200 === httpRequest.status && httpRequest.response) {
                success && success(JSON.parse(httpRequest.response));
            } else {
                error && error(JSON.parse(httpRequest.response));
            }
        }
    }
    let httpRequest = new XMLHttpRequest();
    if(httpRequest) {
        httpRequest.onreadystatechange = responseAJAX;
        if(data.gets) {
            url += '?';
            for(let key in data.gets) { url += key + '=' + data.gets[key] + '&'; }
            url = url.replace(/&$/g, '');
        }
        httpRequest.open(method, url);
        httpRequest.send(data.post);
    } else {
        console.error('Cannot send ajax.');
    }
}

Core.parseDate = function(date) {
    var result;
    if(isNaN(date)) { result = new Date(date); }
    else { result = new Date(date * 1000); }
    return result != 'Invalid Date' ? result : undefined;
}

Core.iterateObject = function(object, func) {
    for(var property in object) {
        if(object.hasOwnProperty(property)) {
            if(object[property] instanceof Array) {
                object[property] = object[property].map(function(item) {
                    return Core.iterateObject(item, func);
                });
            } else if(object[property] instanceof Object) {
                object[property] = Core.iterateObject(object[property], func);
            } else {
                object[property] = func(object[property]);
            }
        }
    }
    return object;
}

Core.getDateStringWithFormat = function(timestamp, format) {
    function pad(num, size) {
        var s = num + "";
        s = s.slice(-size);
        while(s.length < size) { s = "0" + s; }
        return s;
    }
    var dayStringList = ['日', '一', '二', '三', '四', '五', '六'];
    var dateObject = undefined;
    if(1000000000000 > timestamp) { dateObject = new Date(timestamp*1000); }
    else { dateObject = new Date(timestamp); }
    var matchYear = format.match(/Y/g);
    if(matchYear) { format = format.replace(/[Y]+/, pad(dateObject.getFullYear(), matchYear.length)); }
    var matchMonth = format.match(/M/g);
    if(matchMonth) { format = format.replace(/[M]+/, pad(dateObject.getMonth() + 1, matchMonth.length)); }
    var matchDate = format.match(/D/g);
    if(matchDate) { format = format.replace(/[D]+/, pad(dateObject.getDate(), matchDate.length)); }
    if(!!format.match(/d/g)) { format = format.replace(/[d]+/, dayStringList[dateObject.getDay()]); }
    var matchHours = format.match(/h/g);
    if(matchHours) { format = format.replace(/[h]+/, pad(dateObject.getHours(), matchHours.length)); }
    var matchMinutes = format.match(/m/g);
    if(matchMinutes) { format = format.replace(/[m]+/, pad(dateObject.getMinutes(), matchMinutes.length)); }
    var matchSeconds = format.match(/s/g);
    if(matchSeconds) { format = format.replace(/[s]+/, pad(dateObject.getSeconds(), matchSeconds.length)); }
    return format;
}

Core.newUuid = function() {
    var regexp = new RegExp('[xy]', 'g');
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(regexp, function(c) {
        var r = Core.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

Core.getUrlSearches = function() {
    var result = {};
    var searches = window.location.search;
    searches = searches.slice(1).split('&');
    searches.map(function(search) {
        var pair = search.split('=');
        result[pair[0]] = pair[1];
    }, this);
    return result;
}

module.exports = Core;
window.Core = Core;

// http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
// Warn if overriding existing method
if(Array.prototype.equals) {
    console.warn(
        'Overriding existing Array.prototype.equals.'
        + ' Possible causes:'
        + " New API defines the method, there's a framework conflict"
        + " or you've got double inclusions in your code."
    );
}
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if(!array) return false;

    // compare lengths - can save a lot of time 
    if(this.length != array.length) return false;

    for(var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if(this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if(!this[i].equals(array[i]))
                return false;       
        } else if(this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});
