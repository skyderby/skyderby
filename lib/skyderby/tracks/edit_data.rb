module Skyderby
  module Tracks
    class EditData < TrackData
      def initialize(track)
        super

        @duration = @points.last[0]
        @ff_start = track.ff_start || 0
        @ff_end = track.ff_end || @duration
      end

      def to_data_attr
        {
          points: @points,
          max_rel_time: @duration,
          range_from: @ff_start,
          range_to: @ff_end,
          pilot_text: @track.name,
          pilot: ({
            id: @track.pilot.id,
            name: @track.pilot.name
          } if @track.pilot),
          suit_text: @track.suit,
          suit: ({
            id: @track.wingsuit.id,
            name: @track.wingsuit.name
          } if @track.wingsuit),
          location: @track.location,
          place: ({
            id: @track.place.id,
            name: @track.place.name
          } if @track.place),
          ground_level: @track.ground_level
        }.to_json
      end

      protected

      def init_points
        points = 
          Point.for_track(@track.id).freq_1Hz.pluck_to_hash(
            :gps_time_in_seconds,
            :elevation,
            :abs_altitude)

        has_abs_altitude = @track.ge_enabled
        msl_offset       = @track.msl_offset
        min_gps_time     = points.first[:gps_time_in_seconds]

        @points = points.map do |point|
          [
            (point[:gps_time_in_seconds] - min_gps_time).to_i, 
            has_abs_altitude ? point[:abs_altitude] - msl_offset : point[:elevation]
          ]
        end
      end
    end
  end
end
