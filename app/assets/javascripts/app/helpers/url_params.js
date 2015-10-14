Skyderby.helpers.getUrlParams = function() {
    var params = {};

    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]).replace('+', ' ');
    }

    return params;
};
