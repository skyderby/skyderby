module Events
  module Rounds
    class Globe
      CompetitorData = Struct.new(:name, :color, :points)

      class EntityBuilder
        def initialize(event_track)
          @event_track = event_track
        end

        def execute
          event_track
            .track
            .points
            .trimmed
            .freq_1Hz
            .pluck_to_hash(:latitude,
                           :longitude,
                           :abs_altitude,
                           'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time')
        end

        private

        attr_reader :event_track
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

      def to_json
        {
          range_from: round.range_from,
          range_to: round.range_to,
          boundaries_position: boundaries_position,
          start_time: start_time,
          stop_time: stop_time,
          competitors: competitors
        }.to_json
      end

      def competitors
        @competitors ||= round.event_tracks.map.with_index do |event_track, index|
          CompetitorData.new.tap do |c|
            c.name = event_track.competitor.name
            c.color = colors[index]
            c.points = EntityBuilder.new(event_track).execute
          end
        end
      end

      private

      attr_reader :round

      def boundaries_position
        if round.event.place
          place = round.event.place
          {
            latitude: place.latitude,
            longitude: place.longitude,
            ground_offset: place.msl
          }
        else
          place = competitors.first.points.last
          {
            latitude: place[:latitude],
            longitude: place[:longitude],
            ground_offset: place[:abs_altitude]
          }
        end
      end

      def colors
        COLORS * (round.event_tracks.size.to_f / COLORS.size).ceil
      end

      def start_time
        all_points.order(gps_time_in_seconds: :asc)
                  .limit(1)
                  .pluck('to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time')
                  .first
      end

      def stop_time
        all_points.order(gps_time_in_seconds: :desc)
                  .limit(1)
                  .pluck('to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time')
                  .first
      end

      def all_points
        Point.where(track_id: EventTrack.where(round: round).pluck(:track_id))
      end
    end
  end
end
