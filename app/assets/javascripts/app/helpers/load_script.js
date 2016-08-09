Skyderby.helpers.load_script = function(src, on_error_callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (on_error_callback) script.onerror = on_error_callback;
    document.getElementsByTagName("head")[0].appendChild(script);
    script.src = src;
};
