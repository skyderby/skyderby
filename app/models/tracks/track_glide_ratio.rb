module Tracks
  module TrackGlideRatio
    def glide_ratio_chart_line
      points.map do |x|
        {
          'x' => (x[:gps_time] - min_gps_time).round(1),
          'y' => y_for_glide_ratio(x[:glide_ratio]),
          'true_value' => glide_ratio_presentation(x[:glide_ratio])
        }
      end.to_json.html_safe
    end

    def wind_effect_glide_ratio_chart_line
      zerowind_points.each_with_index.map do |point, index|
        {
          'x' => (point[:gps_time] - min_gps_time).round(1),
          'low' => y_for_glide_ratio(point[:glide_ratio]),
          'high' => y_for_glide_ratio(points[index][:glide_ratio]),
          'true_value' => glide_ratio_presentation(point[:glide_ratio])
        }
      end.to_json.html_safe
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

    def glide_ratio_presentation(value)
      value.round(2)
    end

    def y_for_glide_ratio(value)
      if value.negative?
        0
      elsif value > 7
        7
      else
        value.round(2)
      end
    end
  end
end
