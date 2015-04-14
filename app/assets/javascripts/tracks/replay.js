var TrackVideo = {};
var player;
var done = false;
var yt_timer_id = 0;

function init_replay() {
    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.

}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: TrackVideo.video_code,
        playerVars: {
            fs: 0,
            iv_load_policy: 3,
            rel: 0
        },

        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
    });
}
// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    // event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        yt_timer_id = setInterval(function () {
            var curTime = player.getCurrentTime();
            updateProgress(curTime);
        }, 500);
        done = true;
    } else if (event.data == YT.PlayerState.ENDED || event.data == YT.PlayerState.PAUSED) {
        if (yt_timer_id) {
            clearInterval(yt_timer_id);
            done = false;
        }
    }
}

function data_on_time(cur_time) {
    var time = cur_time - TrackVideo.video_offset,
        floor = null,
        ceil = null;

    if (time < 0) {
        return null;
    }

    var track_time = time + (+TrackVideo.track_offset);

    for (i = 0; i < TrackVideo.points.length; i++) {
        if (TrackVideo.points[i].fl_time_abs == Math.floor(track_time)) {
            floor = TrackVideo.points[i];
        }

        if (TrackVideo.points[i].fl_time_abs == Math.ceil(track_time)) {
            ceil = TrackVideo.points[i];
        }
    }

    if (!floor && !ceil) {
        return null;
    }
    
    if (floor.fl_time_abs == ceil.fl_time_abs) {
        return {
            altitude: Math.round(floor.elevation),
            elev_diff: Math.round(TrackVideo.max_altitude - floor.elevation),
            v_speed: floor.v_speed,
            h_speed: floor.h_speed,
            gr: floor.glrat
        }
    } else {
        var k = ((+ceil.fl_time_abs) - (+floor.fl_time_abs)) * (time - (floor.fl_time_abs - TrackVideo.track_offset));
        var v_speed = floor.v_speed + (ceil.v_speed - floor.v_speed) * k;
        var h_speed = floor.h_speed + (ceil.h_speed - floor.h_speed) * k;
        var gr = floor.glrat + (ceil.glrat - floor.glrat) * k;
        var elevation = floor.elevation - (floor.elevation - ceil.elevation) * k;
        return {
            altitude: Math.round(elevation),
            elev_diff: Math.round(TrackVideo.max_altitude - elevation),
            v_speed: Math.round(v_speed),
            h_speed: Math.round(h_speed),
            gr: gr.toFixed(2)
        }
    }
}

function updateProgress(cur_time) {
    var el = data_on_time(cur_time);

    if (el) {
      $('#p_cur_h_speed').text(Math.round(el.h_speed));
      $('#p_cur_v_speed').text(Math.round(el.v_speed));
      $('#p_cur_gr').text(el.gr);
      $('#p_cur_elev').text(el.altitude);
      $('#p_elev_diff').text(el.elev_diff);
    } else {
      $('#p_cur_h_speed').text('---');
      $('#p_cur_v_speed').text('---');
      $('#p_cur_gr').text('-.--');
      $('#p_cur_elev').text('---');
      $('#p_elev_diff').text('---');
    }
}

$(document).on('ready page:load', function() {
    var data_div = $('.track-replay');
    if (data_div.length) {
        TrackVideo.video_code = data_div.data('video-code');
        TrackVideo.points = data_div.data('points');
        TrackVideo.video_offset = data_div.data('video-offset');
        TrackVideo.track_offset = data_div.data('track-offset');
        TrackVideo.max_altitude = TrackVideo.points[0].elevation;

        init_replay();
    }                
});
