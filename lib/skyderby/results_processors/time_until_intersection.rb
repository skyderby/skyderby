require 'geometry/geometry'
require 'tracks/points_interpolation'

module Skyderby
  module ResultsProcessors
    class TimeUntilIntersection
      def initialize(track_points, params)
        @track_points = track_points.points

        validate! params
        @start_time = params[:start_time]
        @finish_segment = flight_segment(params[:finish_line])
      end

      def calculate
        intersected_segment =
          @track_points.each_cons(2).detect do |pair|
            segment = flight_segment(pair)
            segment.intersects_with? @finish_segment
          end

        return nil unless intersected_segment

        segment = flight_segment(intersected_segment)
        intersection_point = segment.intersection_point_with(@finish_segment)

        hash_point = Skyderby::Geospatial.mercator_to_coordinates(
          intersection_point.x,
          intersection_point.y
        )

        finish_time = PointsInterpolation.find_between(
          intersected_segment.first,
          intersected_segment.last,
          interpolation_coeff(intersected_segment, hash_point)
        ).gps_time
        (finish_time.to_f - @start_time.to_f).round(3)
      end

      private

      def validate!(params)
        fail ArgumentError, 'Params should be the hash' unless params.is_a? Hash
        fail ArgumentError, 'Params should contain start_time' unless params[:start_time]
        fail ArgumentError, 'Params should contain finish_line' unless params[:finish_line]
      end

      def flight_segment(pair)
        mercator_start = Skyderby::Geospatial.coordinates_to_mercator(
          pair.first.latitude,
          pair.first.longitude
        )

        mercator_end = Skyderby::Geospatial.coordinates_to_mercator(
          pair.last.latitude,
          pair.last.longitude
        )

        Geometry::Segment.new_by_arrays(
          [mercator_start[:x], mercator_start[:y]],
          [mercator_end[:x],   mercator_end[:y]]
        )
      end

      def interpolation_coeff(segment, hash_point)
        interpolate_by_lat =
          (segment.first.latitude - segment.last.latitude).abs >
          (segment.first.longitude - segment.last.longitude).abs

        if interpolate_by_lat
          (segment.first.latitude - hash_point[:latitude]) /
            (segment.first.latitude - segment.last.latitude)
        else
          (segment.first.longitude - hash_point[:longitude]) /
            (segment.first.longitude - segment.last.longitude)
        end.abs
      end
    end
  end
end
