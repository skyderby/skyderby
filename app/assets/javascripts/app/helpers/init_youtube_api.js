Skyderby.helpers.init_youtube_api = function() {
    if (window.Skyderby.youtube_api_ready) {
        window.Skyderby.trigger('youtube_api_ready');
    } else {
        Skyderby.helpers.load_script('https://www.youtube.com/iframe_api');
    }
};
