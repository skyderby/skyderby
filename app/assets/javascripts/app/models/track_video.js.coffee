class Skyderby.models.TrackVideo extends Backbone.Model
  defaults:
    points: []

  max_altitude: ->
    @max_altitude_value ||= @get('points')[0].altitude

  points_around_time: (time) ->
    for point, i in @get('points')
      continue if i == 0
      prev_point = @get('points')[i - 1]
      if prev_point.fl_time <= time <= point.fl_time
        return [prev_point, point]

    return []

  data_on_time: (cur_time) ->
    time = cur_time - @get('video_offset')

    return null if time < 0

    track_time = time + Number(@get('track_offset'))

    [floor, ceil] = @points_around_time(track_time)
    
    return null if !floor && !ceil
    
    if floor.fl_time == ceil.fl_time
      return {
        altitude:    Math.round(floor.altitude)
        elev_diff:   Math.round(@max_altitude() - floor.altitude)
        v_speed:     floor.v_speed
        h_speed:     floor.h_speed
        glide_ratio: floor.glide_ratio
      }
    else
      time_from_start = track_time - floor.fl_time
      interpolation_factor =
        time_from_start / (Number(ceil.fl_time) - Number(floor.fl_time))

      v_speed     = floor.v_speed + (ceil.v_speed - floor.v_speed) * interpolation_factor
      h_speed     = floor.h_speed + (ceil.h_speed - floor.h_speed) * interpolation_factor
      glide_ratio = floor.glide_ratio + (ceil.glide_ratio - floor.glide_ratio) * interpolation_factor
      altitude    = floor.altitude - (floor.altitude - ceil.altitude) * interpolation_factor

      return {
        altitude:    Math.round(altitude)
        elev_diff:   Math.round(@max_altitude() - altitude)
        v_speed:     Math.round(v_speed)
        h_speed:     Math.round(h_speed)
        glide_ratio: glide_ratio.toFixed(2)
      }
