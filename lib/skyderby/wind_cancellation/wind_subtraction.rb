require 'matrix'

module Skyderby
  module WindCancellation
    class WindSubtraction
      include Skyderby::Trigonometry
      include Skyderby::Geospatial

      def initialize(points, weather_data)
        @points = points
        @weather_data = weather_data

        @date = @points.first.gps_time
      end

      def execute
        result = []

        accum_offset = Vector[0, 0]

        @points.each do |point|

          accum_offset += vector_from_wind_data(point.elevation, point.fl_time)
          shift_direction =
            rad_to_deg(Math.atan2(accum_offset[1], accum_offset[0]))

          new_position = shift_position(
            point.latitude,
            point.longitude,
            accum_offset.magnitude,
            shift_direction
          )          

          new_point = point.clone
          new_point.latitude, new_point.longitude = new_position[:latitude], new_position[:longitude]
          result << new_point
        end

        result
      end

      private

      def vector_from_wind_data(elevation, time)
        weather_datum = @weather_data.weather_on @date, elevation

        offset = weather_datum[:wind_speed] * time
        subtract_direction = weather_datum[:wind_direction]

        subtract_direction_rad = deg_to_rad(subtract_direction)

        Vector[Math.cos(subtract_direction_rad) * offset,
               Math.sin(subtract_direction_rad) * offset]
      end
    end
  end
end
