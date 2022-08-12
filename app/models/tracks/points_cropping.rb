module Tracks
  module PointsCropping
    def cropped_points(points, range_from, range_to) # rubocop:disable Metrics/PerceivedComplexity,Metrics/CyclomaticComplexity,Metrics/AbcSize
      return points if points.blank? || points.length == 1

      start_index = points.index { |x| x[:altitude] <= range_from } || 0
      start_point = points[start_index]

      end_index = points.index { |x| x[:gps_time] > start_point[:gps_time] && x[:altitude] <= range_to }
      end_index ||= points.count - 1
      end_point = points[end_index]

      result_array = []
      unless start_point[:altitude] == range_from
        interpolated_start = interpolate_by_altitude(points[start_index - 1], start_point, range_from)
        result_array += [interpolated_start]
      end

      if end_point[:altitude] == range_to
        result_array += points[start_index..end_index]
      else
        result_array += points[start_index..(end_index - 1)]
        interpolated_end = interpolate_by_altitude(points[end_index - 1], points[end_index], range_to)
        result_array += [interpolated_end]
      end

      result_array
    end

    def interpolate_by_altitude(first, second, altitude)
      k = (first[:altitude] - altitude) / (first[:altitude] - second[:altitude])

      new_point = first.clone
      new_point[:altitude] = altitude
      [:gps_time, :fl_time, :latitude, :longitude, :h_speed, :v_speed, :distance].each do |key|
        new_point[key] = interpolate_field(first, second, key, k)
      end

      new_point
    end

    def interpolate_field(first, second, key, coeff)
      first[key] + ((second[key] - first[key]) * coeff)
    end
  end
end
