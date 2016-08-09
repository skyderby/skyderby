module Skyderby
  module WindCancellation
    class WindData
      def initialize(weather_data)
        @weather_data = weather_data.pluck_to_hash(
          :actual_on,
          :altitude,
          :wind_speed,
          :wind_direction
        )

        fail ArgumentError, 'Weather data is empty' if @weather_data.empty?
      end

      def weather_on(date, altitude)
        filtered = filter_by_date(@weather_data, date)
        grouped = group_by_altitude_and_date(filtered)
        select_by_altitude(grouped, altitude)
      end

      private

      def group_by_altitude_and_date(weather_data)
        weather_data
          .group_by { |x| x[:altitude] }
          .map { |_, v| v.sort_by { |x| -x[:actual_on].to_i }.first }
      end

      def filter_by_date(weather_data, date)
        weather_data.select { |x| x[:actual_on] < date }
      end

      def select_by_altitude(weather_data, altitude)
        weather_data.sort_by! { |x| x[:altitude] }

        return weather_data.first if altitude <= weather_data.first[:altitude]
        return weather_data.last if altitude > weather_data.last[:altitude]

        pair = weather_data.each_cons(2).detect do |pair|
          altitude.between? pair.first[:altitude], pair.last[:altitude]
        end

        interpolate pair, altitude
      end

      def interpolate(pair, altitude)
        # interpolation coefficient. In example:
        # For altitude: 720.74
        # Given pair:
        #  - 1000 m | 13 m/s
        #  - 0 m    | 3 m/s
        # Will calculate 0.72074
        coeff =
          (altitude - pair.first[:altitude]) / (pair.last[:altitude] - pair.first[:altitude])

        result = pair.first.clone

        result[:wind_speed] += 
          (pair.last[:wind_speed] - pair.first[:wind_speed]) * coeff

        result[:wind_direction] += 
          (pair.last[:wind_direction] - pair.first[:wind_direction]) * coeff

        result
      end
    end
  end
end
