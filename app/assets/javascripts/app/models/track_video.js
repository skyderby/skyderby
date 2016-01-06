Skyderby.models.TrackVideo = Backbone.Model.extend({
    defaults: {
        points: []
    },

    max_altitude: function() {
        if (!this.max_altitude_value) this.max_altitude_value = this.get('points')[0].elevation;

        return this.max_altitude_value;
    },

    data_on_time: function(cur_time) {
        var time = cur_time - this.get('video_offset'),
            floor = null,
            ceil = null;

        if (time < 0) {
            return null;
        }

        var track_time = time + Number(this.get('track_offset'));

        for (var i = 1; i < this.get('points').length; i++) {
            if (this.get('points')[i - 1].fl_time_abs <= track_time &&
                   this.get('points')[i].fl_time_abs >= track_time) {

                floor = this.get('points')[i - 1];
                ceil = this.get('points')[i];

                break;
            }
        }

        if (!floor && !ceil) {
            return null;
        }
        
        if (floor.fl_time_abs == ceil.fl_time_abs) {
            return {
                altitude: Math.round(floor.elevation),
                elev_diff: Math.round(this.max_altitude() - floor.elevation),
                v_speed: floor.v_speed,
                h_speed: floor.h_speed,
                gr: floor.glrat
            };
        } else {
            var k = (time - (floor.fl_time_abs - this.get('track_offset'))) / (Number(ceil.fl_time_abs) - Number(floor.fl_time_abs));
            var v_speed = floor.v_speed + (ceil.v_speed - floor.v_speed) * k;
            var h_speed = floor.h_speed + (ceil.h_speed - floor.h_speed) * k;
            var gr = floor.glrat + (ceil.glrat - floor.glrat) * k;
            var elevation = floor.elevation - (floor.elevation - ceil.elevation) * k;
            return {
                altitude: Math.round(elevation),
                elev_diff: Math.round(this.max_altitude() - elevation),
                v_speed: Math.round(v_speed),
                h_speed: Math.round(h_speed),
                gr: gr.toFixed(2)
            };
        }
    }
});
