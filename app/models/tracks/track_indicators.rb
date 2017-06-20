module Tracks
  module TrackIndicators
    def elevation
      altitude_presentation(track_elevation)
    end

    def time
      return 0.0 if points.blank?
      (points.last[:gps_time] - points.first[:gps_time]).round(1)
    end

    def glide_ratio
      return nil if track_elevation.zero?
      (track_distance.to_d / track_elevation.to_d).round(2)
    end

    def min_glide_ratio
      return 0.0 if points.blank?

      point = points.min_by { |x| x[:glide_ratio] }
      glide_ratio_presentation(point[:glide_ratio])
    end

    def max_glide_ratio
      return 0.0 if points.blank?

      point = points.max_by { |x| x[:glide_ratio] }
      if point[:glide_ratio] < 10
        glide_ratio_presentation(point[:glide_ratio])
      else
        '≥10'
      end
    end

    def zero_wind_glide_ratio
      return 0.0 if track_elevation.zero?
      (zero_wind_trajectory_distance.to_d / track_elevation.to_d).round(2)
    end

    def glide_ratio_wind_effect
      wind_effect = glide_ratio - zero_wind_glide_ratio
      sign = wind_effect.positive? ? '+' : ''
      "#{sign}#{wind_effect.round(2)}"
    end

    def avg_vertical_speed
      return nil if time.zero?
      speed_presentation(track_elevation / time)
    end

    def min_vertical_speed
      return 0.0 if points.blank?

      point = points.min_by { |x| x[:v_speed] }
      speed_presentation(point[:v_speed])
    end

    def max_vertical_speed
      return 0.0 if points.blank?

      point = points.max_by { |x| x[:v_speed] }
      speed_presentation(point[:v_speed])
    end

    def avg_horizontal_speed
      return nil if time.zero?
      speed_presentation(track_distance / time)
    end

    def min_horizontal_speed
      return 0.0 if points.blank?

      point = points.min_by { |x| x[:h_speed] }
      speed_presentation(point[:h_speed])
    end

    def max_horizontal_speed
      return 0.0 if points.blank?

      point = points.max_by { |x| x[:h_speed] }
      speed_presentation(point[:h_speed])
    end

    def zero_wind_horizontal_speed
      speed_presentation(zero_wind_trajectory_distance / time)
    end

    def horizontal_speed_wind_effect
      wind_effect = (track_distance / time) - (zero_wind_trajectory_distance / time)
      sign = wind_effect.positive? ? '+' : ''
      "#{sign}#{speed_presentation(wind_effect)}"
    end

    def horizontal_speed_wind_effect_in_percents
      raw_speed = (track_distance / time)
      zero_wind = (zero_wind_trajectory_distance / time)

      ((raw_speed - zero_wind).abs / raw_speed * 100).round
    end

    def zero_wind_horizontal_speed_in_percents
      100 - horizontal_speed_wind_effect_in_percents
    end

    def distance
      distance_presentation(track_distance)
    end

    def zero_wind_distance
      distance_presentation(zero_wind_trajectory_distance)
    end

    def distance_wind_effect
      wind_effect = track_distance - zero_wind_trajectory_distance
      sign = wind_effect.positive? ? '+' : ''
      "#{sign}#{distance_presentation(wind_effect)}"
    end

    def distance_wind_effect_in_percents
      ((track_distance - zero_wind_distance).abs / track_distance * 100).round
    end

    def zero_wind_distance_in_percents
      100 - distance_wind_effect_in_percents
    end
  end
end
