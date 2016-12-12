module RangesToScoreFinder
  class BaseFinder
    def initialize(altitude_bounds)
      @altitude_bounds = altitude_bounds
    end

    def calculate
      [{ start_altitude: altitude_bounds[:max_altitude] - 10,
         end_altitude: altitude_bounds[:min_altitude] }]
    end

    private

    attr_reader :altitude_bounds
  end
end
