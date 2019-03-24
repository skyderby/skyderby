module Events
  module Rounds
    class Globe
      CompetitorData = Struct.new(:name, :color, :points, :start_time)

      class EntityBuilder
        def initialize(result)
          @result = result
        end

        def execute
          result
            .track
            .points
            .trimmed
            .freq_1hz
            .pluck_to_hash(:latitude,
                           :longitude,
                           :abs_altitude,
                           'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time')
        end

        private

        attr_reader :result
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

      delegate :range_from, :range_to, to: :round

      def initialize(round)
        @round = round
      end

      def competitors_by_groups
        @competitors_by_groups ||= begin
          sorted_competitors = competitors.sort_by(&:start_time)
          sorted_competitors.slice_when do |first, second|
            (first.start_time - second.start_time).abs >= 2.minutes
          end
        end
      end

      def competitors
        @competitors ||= round.results.map.with_index do |result, index|
          CompetitorData.new.tap do |c|
            c.name = result.competitor.name
            c.color = colors[index]
            c.points = EntityBuilder.new(result).execute
            c.start_time = c.points.first[:gps_time]
          end
        end
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

      private

      attr_reader :round

      def colors
        COLORS * (round.results.size.to_f / COLORS.size).ceil
      end

      def all_points
        Point.where(track_id: round.results.pluck(:track_id))
      end
    end
  end
end
