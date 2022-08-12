module RangesToScoreFinder
  class SkydiveFinder
    STEP = 50
    RANGE_SIZE = 1000

    MIN_ALTITUDE = 1000

    def initialize(altitude_bounds)
      @altitude_bounds = altitude_bounds
    end

    # returns array of hashes with structure
    # [
    #   { start_altitude: 3050, end_altitude: 2050 }
    #   { start_altitude: 3000, end_altitude: 2000 }
    # ]
    def calculate
      return [] if single_range? && height_diff <= 0
      return whole_range if single_range?

      split_bounds_on_ranges
    end

    private

    attr_reader :altitude_bounds

    def single_range?
      height_diff <= RANGE_SIZE
    end

    def whole_range
      [{
        start_altitude: max_altitude,
        end_altitude: min_altitude
      }]
    end

    def split_bounds_on_ranges
      Array.new(steps) do |index|
        altitude_change = STEP * index
        {
          start_altitude: max_altitude - altitude_change,
          end_altitude: max_altitude - RANGE_SIZE - altitude_change
        }
      end
    end

    def steps
      ((height_diff - RANGE_SIZE) / STEP).floor
    end

    def height_diff
      max_altitude - min_altitude
    end

    # round lower to step size
    def max_altitude
      altitude_bounds[:max_altitude] - (altitude_bounds[:max_altitude] % STEP)
    end

    # rounds upper to step size
    def min_altitude
      altitude_addition = STEP - (altitude_bounds[:min_altitude] % STEP)
      altitude_addition = 0 if altitude_addition == 50
      bounds_altitude = altitude_bounds[:min_altitude] + altitude_addition

      [bounds_altitude, MIN_ALTITUDE].max
    end
  end
end
