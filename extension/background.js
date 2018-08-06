// https://github.com/bbraithwaite/omdb-client
// omdb-client 2.0.0
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).omdb=e()}}(function(){return function e(t,r,o){function n(s,a){if(!r[s]){if(!t[s]){var u="function"==typeof require&&require;if(!a&&u)return u(s,!0);if(i)return i(s,!0);var p=new Error("Cannot find module '"+s+"'");throw p.code="MODULE_NOT_FOUND",p}var l=r[s]={exports:{}};t[s][0].call(l.exports,function(e){var r=t[s][1][e];return n(r||e)},l,l.exports,e,t,r,o)}return r[s].exports}for(var i="function"==typeof require&&require,s=0;s<o.length;s++)n(o[s]);return n}({1:[function(e,t,r){"use strict";t.exports.getJson=function(){var e,t=new XMLHttpRequest,r=arguments[0],o=1e4;"function"==typeof arguments[1]&&(e=arguments[1]),"number"==typeof arguments[1]&&(o=arguments[1],e=arguments[2]),t.onreadystatechange=function(){this.timeout=o,4===this.readyState&&(200===this.status?e(null,this.response):0!==this.status&&e(this))},t.open("GET",r),t.responseType="json",t.timeout=o,t.ontimeout=e,t.send()}},{}],2:[function(e,t,r){t.exports.get=e("./lib/get"),t.exports.search=e("./lib/search")},{"./lib/get":3,"./lib/search":4}],3:[function(e,t,r){"use strict";var o=e("./../client/json-http.js"),n=e("./validator");t.exports=function(e,t){var r,i,s,a=(r=e)?r.hasOwnProperty("id")||r.hasOwnProperty("title")?r.hasOwnProperty("title")&&!n.isString(r.title)?{error:"title must be a string."}:r.hasOwnProperty("id")&&!n.isString(r.id)?{error:"id must be a string."}:n.isValidType(r)?r.hasOwnProperty("year")&&!n.isNumber(r.year)?{error:"year must be a valid number"}:n.isValidPlotType(r)?r.hasOwnProperty("incTomatoes")&&!n.isBoolean(r.incTomatoes)?{error:"incTomatoes must be a boolean."}:void 0:{error:"plot must be: short, full."}:{error:"type must be: movie, series, episode."}:{error:"id or title param required."}:{error:"params cannot be null."},u=e&&e.timeout||1e4;a?t(a.error,null):o.getJson((s="?",(i=e).id&&(s+="i=".concat(i.id)),i.title&&(i.id?s+="&t=":s+="t=",s+=encodeURIComponent(i.title)),i.year&&(s+="&y=".concat(i.year)),i.incTomatoes&&(s+="&tomatoes=".concat(i.incTomatoes)),i.type&&(s+="&type=".concat(i.type)),i.plot&&(s+="&plot=".concat(i.plot)),i.apiKey&&(s+="&apiKey=".concat(i.apiKey)),"http://www.omdbapi.com/".concat(s,"&r=json&v=1")),u,function(e,r){e?t(e,null):r.Error?t(r.Error,null):t(null,r)})}},{"./../client/json-http.js":1,"./validator":5}],4:[function(e,t,r){"use strict";var o=e("./../client/json-http.js"),n=e("./validator");t.exports=function(e,t){var r,i,s,a=(r=e)?r.hasOwnProperty("query")?n.isString(r.query)?n.isValidType(r)?r.hasOwnProperty("year")&&!n.isNumber(r.year)?{error:"year must be a valid number"}:void 0:{error:"type must be: movie, series, episode."}:{error:"query must be a string."}:{error:"query param required."}:{error:"params cannot be null."},u=e&&e.timeout||1e4;a?t(a.error,null):o.getJson((i=e,s="?",s+="s=".concat(encodeURIComponent(i.query)),i.year&&(s+="&y=".concat(i.year)),i.type&&(s+="&type=".concat(i.type)),i.apiKey&&(s+="&apikey=".concat(i.apiKey)),"http://www.omdbapi.com/".concat(s,"&r=json&v=1")),u,function(e,r){e?t(e,null):r.Error?t(r.Error,null):t(null,r)})}},{"./../client/json-http.js":1,"./validator":5}],5:[function(e,t,r){"use strict";var o=function(e,t){return typeof e===t};t.exports.isString=function(e){return o(e,"string")},t.exports.isNumber=function(e){return o(e,"number")},t.exports.isBoolean=function(e){return o(e,"boolean")},t.exports.isValidType=function(e){return!e.hasOwnProperty("type")||null!==e.type.match("movie|series|episode")},t.exports.isValidPlotType=function(e){return!e.hasOwnProperty("plot")||null!==e.plot.match("short|full")}},{}]},{},[2])(2)}); 

var OMNIBOX_MAX_RESULTS = 20;
var OMDB_API_KEY = 'OMDB_API_KEY';

chrome.omnibox.setDefaultSuggestion({
    description: 'Loading Movies and TvShows'
});

(function init() {
    chrome.omnibox.setDefaultSuggestion({
        description: 'Search IMDB and redirect to RARbg for <match>%s</match>'
    });

    chrome.omnibox.onInputChanged.addListener(
        function(query, suggestFn) {
            if (!query)
                return;

            suggestFn = suggestFn || function() {};

            var params = {
                apiKey: OMDB_API_KEY,
                query: query
            }
            window.omdb.search(params, function(err, data) {
                var results = data.Search;
                var omniboxResults = [];

                for (var i = 0; i < OMNIBOX_MAX_RESULTS && i < results.length; i++) {
                    var result = results[i];
                    var description = result.Title + ' (' + result.Year + '), ' + upperFirst(result.Type);

                    omniboxResults.push({
                        content: buildRarbgUrl(result),
                        description: description
                    });
                }

                suggestFn(omniboxResults);
            });

        }
    );

    chrome.omnibox.onInputEntered.addListener(function(text) {
        if (text.match(/^https?\:/)) {
            navigateToUrl(text);
        } else {
            findAndRedirect(text);
        }
    });

})();

function findAndRedirect(query) {
    var params = {
        apiKey: OMDB_API_KEY,
        title: query
    }
    window.omdb.get(params, function(err, data) {
        navigateToUrl(buildRarbgUrl(data));
    });
}

function buildRarbgUrl(data) {
    var id = data.imdbID;
    var path
    switch (data.Type) {
        case 'movie':
            path = 'torrents.php?imdb=' + id;
            break;
        case 'series':
            path = 'tv/' + id + '/';
            break;
        default:
            path = 'torrents.php?search=' + data.Title + '&category%5B%5D=18&category%5B%5D=41&category%5B%5D=49';
    }
    return 'https://rarbg.to/' + path;
}

function navigateToUrl(url) {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.update(tab.id, {
            url: url
        });
    });
}

function upperFirst(string) {
    return string.charAt(0).toUpperCase() + string.substr(1);
}