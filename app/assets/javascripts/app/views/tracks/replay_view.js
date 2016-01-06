Skyderby.views.TrackReplayView = Backbone.View.extend({

    done: false,
    
    yt_timer_id: 0,

    initialize: function(opts) {},
    
    render: function() {
        this.listenToOnce(window.Skyderby, 'youtube_api_ready', this.on_youtube_api_ready);
        window.Skyderby.helpers.init_youtube_api();
    },

    on_youtube_api_ready: function() {
        this.player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: this.model.get('video_code'),
            playerVars: {
                fs: 0,
                iv_load_policy: 3,
                rel: 0
            },

            events: {
              'onReady': this.on_player_ready.bind(this),
              'onStateChange': this.on_player_state_change.bind(this)
            }
        });
    },

    on_player_ready: function(event) {},

    on_player_state_change: function(event) {
        if (event.data == YT.PlayerState.PLAYING && !this.done) {
            var _this = this;
            this.yt_timer_id = setInterval(function () {
                var curTime = _this.player.getCurrentTime();
                _this.updateProgress(curTime);
            }, 500);
            this.done = true;
        } else if (event.data == YT.PlayerState.ENDED || event.data == YT.PlayerState.PAUSED) {
            if (this.yt_timer_id) {
                clearInterval(this.yt_timer_id);
                this.done = false;
            }
        }
    },

    updateProgress: function(cur_time) {
        var el = this.model.data_on_time(cur_time);

        if (el) {
          this.$('#p_cur_h_speed').text(Math.round(el.h_speed));
          this.$('#p_cur_v_speed').text(Math.round(el.v_speed));
          this.$('#p_cur_gr').text(el.gr);
          this.$('#p_cur_elev').text(el.altitude);
          this.$('#p_elev_diff').text(el.elev_diff);
        } else {
          this.$('#p_cur_h_speed').text('---');
          this.$('#p_cur_v_speed').text('---');
          this.$('#p_cur_gr').text('-.--');
          this.$('#p_cur_elev').text('---');
          this.$('#p_elev_diff').text('---');
        }
    }
});
