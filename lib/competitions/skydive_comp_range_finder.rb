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
    def initialize(track, range_from, range_to)
      @track_points = TrackPoints.new(track).trimmed
      @range_from = range_from
      @range_to = range_to
    end

    def process
      JumpRange.new(start_point, end_point)
    end

    private

    def start_point
      start = nil

      @track_points.each_cons(2) do |pair|
        if pair.last[:elevation] <= @range_from
          start = PointsInterpolation.find_between(
            TrackPoint.new(pair.first), 
            TrackPoint.new(pair.last),
            coefficient(pair.first, pair.last, @range_from)
          )
        end
        break if start
      end

      start
    end

    def end_point
      end_range = nil

      @track_points.each_cons(2) do |pair|
        if pair.last[:elevation] <= @range_to
          end_range = PointsInterpolation.find_between(
            TrackPoint.new(pair.first), 
            TrackPoint.new(pair.last), 
            coefficient(pair.first, pair.last, @range_to)
          )
        end
        break if end_range
      end

      end_range
    end

    def coefficient(first, last, altitude)
      (first[:elevation] - altitude) / (first[:elevation] - last[:elevation])
    end
  end

  def self.for(track, range_from, range_to)
    RangeFinder.new(track, range_from, range_to).process
  end
end
