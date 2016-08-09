# FAI Rules
# Competition Window: A vertical 1000 meter window, starting
# at 3000 meters and ending at 2000 meters AGL, in which the
# performance of the wingsuit flyer is evaluated. The first
# crossing of the upper window boundary starts the evaluation
# process, which is stopped at the first crossing of the lower
# window boundary.

require 'tracks/points_interpolation'

module SkydiveCompRange
  class RangeFinder
    def initialize(points, range_from, range_to)
      @points = points
      @range_from = range_from
      @range_to = range_to
    end

    def process
      start_point = find_point_near_altitude @range_from
      end_point = find_point_near_altitude @range_to
      Skyderby::Tracks::JumpRange.new(start_point, end_point)
    end

    private

    def find_point_near_altitude(altitude)
      pair =
        @points.each_cons(2).detect do |pair|
          altitude.between? pair.last[:elevation], pair.first[:elevation]
        end

      return nil unless pair

      PointsInterpolation.find_between(pair.first, pair.last,
                                       coeff(pair.first, pair.last, altitude))
    end

    def coeff(first, last, altitude)
      (first[:elevation] - altitude) / (first[:elevation] - last[:elevation])
    end
  end

  def self.for(track, range_from, range_to)
    RangeFinder.new(track, range_from, range_to).process
  end
end
