# FAI Rules
# Competition Window: A vertical 1000 meter window, starting 
# at 3000 meters and ending at 2000 meters AGL, in which the 
# performance of the wingsuit flyer is evaluated. The first 
# crossing of the upper window boundary starts the evaluation 
# process, which is stopped at the first crossing of the lower 
# window boundary.

require 'tracks/track_point'
require 'tracks/points_interpolation'
require 'tracks/jump_range'

module SkydiveCompRange
  class RangeFinder
    def initialize(track_points, range_from, range_to)
      @track_points = track_points.trimmed
      @range_from = range_from
      @range_to = range_to
    end

    def process
      JumpRange.new(start_point, end_point)
    end

    private

    def start_point
      pair = 
        @track_points.each_cons(2).detect do |pair| 
          @range_from.between? pair.last[:elevation], pair.first[:elevation]
        end

      return nil unless pair

      PointsInterpolation.find_between(pair.first, pair.last,
        coeff(pair.first, pair.last, @range_from))
    end

    def end_point
      pair = 
        @track_points.each_cons(2).detect do |pair|
          @range_to.between? pair.last[:elevation], pair.first[:elevation]
        end

      return nil unless pair

      PointsInterpolation.find_between(pair.first, pair.last, 
        coeff(pair.first, pair.last, @range_to))
    end

    def coeff(first, last, altitude)
      (first[:elevation] - altitude) / (first[:elevation] - last[:elevation])
    end
  end

  def self.for(track, range_from, range_to)
    RangeFinder.new(track, range_from, range_to).process
  end
end
