module Events
  module Rounds
    class Map

      class CompetitorTrack < SimpleDelegator
        attr_accessor :start_point,
                      :end_point,
                      :start_time,
                      :path_coordinates,
                      :direction,
                      :color
      end

      COLORS = [
        '#7cb5ec',
        '#434348',
        '#90ed7d',
        '#f7a35c',
        '#8085e9',
        '#f15c80',
        '#e4d354',
        '#8085e8',
        '#8d4653',
        '#91e8e1'
      ].freeze

      def initialize(round)
        @round = round
      end

      def competitors
        @competitors ||= round.event_tracks.map do |event_track|
          competitor_track(event_track)
        end
      end

      def competitors_by_groups
        @competitors_by_groups ||= begin
          sorted_competitors = competitors.sort_by(&:start_time)
          sorted_competitors.each_with_index do |competitor_info, index|
            competitor_info.color = colors[index]
          end
          sorted_competitors.slice_when do |first, second|
            (first.start_time - second.start_time).abs >= 2.minutes
          end
        end
      end

      def to_json
        competitors.map do |v|
          {
            id: v.id,
            name: v.name.titleize,
            path_coordinates: v.path_coordinates,
            start_point: v.start_point,
            end_point: v.end_point,
            color: v.color
          }
        end.to_json.html_safe
      end

      private

      attr_reader :round

      def competitor_track(event_track)
        competitor_info = CompetitorTrack.new(event_track.competitor)
        points = track_points(event_track.track)
        competitor_info.path_coordinates = path_coordinates(points)
        begin
          track_segment = WindowRangeFinder.new(points).execute(
            from_altitude: round.range_from,
            to_altitude: round.range_to
          )
          competitor_info.start_point = map_marker(track_segment.start_point)
          competitor_info.end_point = map_marker(track_segment.end_point)
          competitor_info.direction = track_segment.direction
        rescue WindowRangeFinder::ValueOutOfRange
          Rails.logger.debug "Failed to get range data from track #{event_track.track_id}"
          competitor_info.start_point = map_marker(points.first)
          competitor_info.end_point = map_marker(points.last)
        end
        competitor_info.start_time = points.first[:gps_time]
        competitor_info
      end

      def path_coordinates(points)
        points.map { |point| map_marker(point) }
      end

      def map_marker(point)
        { lat: point[:latitude].to_f, lng: point[:longitude].to_f }
      end

      def colors
        COLORS * (round.event_tracks.size.to_f / COLORS.size).ceil
      end

      def track_points(track)
        track.points
             .freq_1Hz
             .trimmed
             .where("#{track.point_altitude_field} > 1200")
             .pluck_to_hash(
               '(to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\') AS gps_time',
               "#{track.point_altitude_field} AS altitude",
               :latitude,
               :longitude
             )
      end
    end
  end
end
