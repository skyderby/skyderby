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

    def distance
      distance_presentation(track_distance)
    end
  end
end
