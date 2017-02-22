module Skyderby
  module Tracks
    class EditData
      attr_reader :track

      def initialize(track)
        @track = track

        @ff_start = track.ff_start || 0
        @ff_end = track.ff_end || duration
      end

      def to_data_attr
        {
          points: points,
          max_rel_time: duration,
          range_from: track.ff_start || 0,
          range_to: track.ff_end || duration,
          pilot_text: track.name,
          pilot: ({
            id: track.pilot.id,
            name: track.pilot.name
          } if track.pilot),
          suit_text: track.suit,
          suit: ({
            id: track.wingsuit.id,
            name: track.wingsuit.name
          } if track.wingsuit),
          location: track.location,
          place: ({
            id: track.place.id,
            name: track.place.name
          } if track.place),
          ground_level: track.ground_level
        }.to_json
      end

      def duration
        points.last.try(:[], 0) || 0
      end

      def points
        @points ||= begin
          min_gps_time = track.points.minimum(:gps_time_in_seconds)

          track.points.reorder('round(gps_time_in_seconds)').pluck_to_hash(
            'DISTINCT ON (round(gps_time_in_seconds))' \
            "gps_time_in_seconds - #{min_gps_time} AS gps_time",
            "#{@track.point_altitude_field} AS altitude"
          ).map { |point| [point[:gps_time].to_i, point[:altitude]] }
        end
      end
    end
  end
end
