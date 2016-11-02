class RangesToScoreFinder
  STEP_SIZE = 50
  SKYDIVE_RANGE = 1000

  MINIMUM_SKYDIVE_RANGE = 1000
  MINIMUM_SKYDIVE_ALTITUDE = 1000

  def initialize(altitude_bounds, activity)
    @altitude_bounds = altitude_bounds
    @activity = activity
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

  def single_range?
    @activity == :base || height_diff <= MINIMUM_SKYDIVE_RANGE
  end

  def whole_range
    [{ start_altitude: max_altitude,
       end_altitude:   min_altitude }]
  end

  def split_bounds_on_ranges
    Array.new(steps) do |index|
      altitude_change = STEP_SIZE * index
      { 
        start_altitude: max_altitude - altitude_change,
        end_altitude:   max_altitude - SKYDIVE_RANGE - altitude_change
      }
    end
  end

  def steps
    steps = ((height_diff - SKYDIVE_RANGE) / STEP_SIZE).floor
  end

  def height_diff
    max_altitude - min_altitude
  end
  
  # round lower to step size
  def max_altitude
    return @altitude_bounds[:max_altitude] if @activity == :base

    @altitude_bounds[:max_altitude] - @altitude_bounds[:max_altitude] % STEP_SIZE
  end
  
  # rounds upper to step size
  def min_altitude
    return @altitude_bounds[:min_altitude] if @activity == :base

    altitude_addition = STEP_SIZE - @altitude_bounds[:min_altitude] % STEP_SIZE
    altitude_addition = 0 if altitude_addition == 50
    bounds_altitude = @altitude_bounds[:min_altitude] + altitude_addition

    [bounds_altitude, MINIMUM_SKYDIVE_ALTITUDE].max
  end
end
