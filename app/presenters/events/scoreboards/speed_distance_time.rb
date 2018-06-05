module Events
  module Scoreboards
    class SpeedDistanceTime
      attr_reader :event

      delegate :adjust_to_wind?, to: :params
      delegate :wind_cancellation, to: :event

      def initialize(event, params)
        @event = event
        @params = params
      end

      def columns_count
        @columns_count ||= rounds.count * 2 + rounds_by_discipline.count + 4
      end

      def display_raw_results?
        !adjust_to_wind?
      end

      def sections
        event.sections.order(:order).map { |section| Category.new(section, self, SpeedDistanceTime::Competitor) }
      end

      def rounds
        @rounds ||= event.rounds.order(:number)
      end

      def rounds_by_discipline
        @rounds_by_discipline ||= rounds.group_by(&:discipline)
      end

      def results
        @results ||= ResultsCollection.new(event.event_tracks, params)
      end

      def to_partial_path
        'events/scoreboards/speed_distance_time'
      end

      private

      attr_reader :params
    end
  end
end
