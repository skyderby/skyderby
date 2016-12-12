module RangesToScoreFinder
  FINDER_BY_ACTIVITY = {
    base: BaseFinder,
    skydive: SkydiveFinder
  }

  def self.for(activity)
    (FINDER_BY_ACTIVITY[activity] || NullRangeFinder)
  end

  class NullRangeFinder
    def initialize(altitude_bounds)
      @altitude_bounds = altitude_bounds
    end

    def calculate
      []
    end
  end
end

