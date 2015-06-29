require 'median_filter'
require 'moving_average'

module Skyderby
  module Tracks
    class Points
      attr_reader :points, :ff_start, :ff_end

      def initialize(track = nil)
        fail ArgumentError.new('Track must be present') if track.nil?

        @track = track
        @points = []
        @ff_start = 0
        @ff_end = 0

        read(track)
      end

      def reduce_freq!
        @points.uniq!{ |x| x.gps_time.round }

        @points.each_cons(2) do |prev, curr|
          curr.fl_time = curr.gps_time - prev.gps_time
          curr.elevation_diff = (prev.abs_altitude - curr.abs_altitude).round(2)
          curr.distance = Skyderby::Geospatial.distance(
            [prev.latitude, prev.longitude],
            [curr.latitude, curr.longitude]
          )
        end
      end

      def trimmed(hsh = {})
        start_time = nil
        end_time = nil

        start_time = @ff_start if @ff_start
        end_time = @ff_end if @ff_end

        start_time = hsh[:start] if hsh[:start]
        end_time = hsh[:end] if hsh[:end]

        track_points = @points.clone

        if start_time
          track_points = track_points.drop_while { |x| x[:fl_time_abs] < start_time }
        end
        if end_time && end_time > 0 && (start_time.blank? || end_time > start_time)
          track_points = track_points.reverse.drop_while { |x| x[:fl_time_abs] > end_time }.reverse
        end

        track_points
      end

      def min_h
        trimmed.min_by { |x| x[:elevation] }[:elevation]
      end

      def max_h
        trimmed.max_by { |x| x[:elevation] }[:elevation]
      end

      private

      def read(track)
        @ff_start = track.ff_start
        @ff_end = track.ff_end

        read_points(track)

        unless track.flysight?
          process_by_distances(@points)
          # @points = MedianFilter.process(@points,
          # 5,
          # [:h_speed, :v_speed])

          @points = MovingAverage.process(@points, 5, [:h_speed, :v_speed])
        end

        calc_gr @points
      end

      def read_points(track)
        points = Point.joins(:tracksegment)
                 .where('tracksegments.track_id' => track.id).to_a

        prev_point = nil
        fl_time = 0

        msl_offset =
          if @track.place
            @track.ground_level
          else
            points.map{ |x| x.abs_altitude }.min
          end

        points.each do |point|
          if prev_point

            fl_time_diff = point.gps_time - prev_point.gps_time
            fl_time = (fl_time + fl_time_diff).round(1)

            elevation_diff = (prev_point.abs_altitude - point.abs_altitude).round(2)
            raw_h = Skyderby::Velocity.ms_to_kmh(point.distance / fl_time_diff)
            raw_v = Skyderby::Velocity.ms_to_kmh(elevation_diff) / fl_time_diff

            @points << Skyderby::Tracks::TrackPoint.new(
              gps_time: point.gps_time,
              fl_time: fl_time_diff,
              fl_time_abs: fl_time,
              elevation_diff: elevation_diff,
              elevation: point.abs_altitude - msl_offset,
              abs_altitude: point.abs_altitude,
              latitude: point.latitude,
              longitude: point.longitude,
              distance: point.distance,
              h_speed: (point.h_speed || 0.0),
              v_speed: (point.v_speed || 0.0),
              raw_h_speed: raw_h,
              raw_v_speed: raw_v)

          end
          prev_point = point
        end
      end

      def process_by_distances(points)
        window_size = 5
        neighbors = (window_size / 2).floor
        temp = ([points.first] * neighbors) + points + ([points.last] * neighbors)

        temp.each_cons(window_size).map do |window|
          distance = window.map { |x| x[:distance] }.inject(0, :+)
          elevation = window.map { |x| x[:elevation_diff] }.inject(0, :+)
          # elevation = window.first[:elevation] - window.last[:elevation]
          fl_time = window.map { |x| x[:fl_time] }.inject(0, :+)

          window[neighbors][:h_speed] = distance / fl_time * 3.6
          window[neighbors][:v_speed] = elevation / fl_time * 3.6

          window[neighbors]
        end
      end

      def calc_gr(points)
        points.each do |p|
          p[:raw_gr] = p[:raw_v_speed] == 0 ? 0 : (p[:raw_h_speed] / p[:raw_v_speed]).round(2)
          p[:glrat] = (p[:h_speed].to_f / p[:v_speed]).round(2)
        end
      end
    end
  end
end
