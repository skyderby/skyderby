module Events
  module Scoreboards
    class HungaryBoogie
      include Results

      attr_reader :event

      delegate :adjust_to_wind?, to: :params
      delegate :wind_cancellation, to: :event

      def initialize(event, params)
        @event = event
        @params = params
      end

      def display_raw_results?
        !adjust_to_wind?
      end

      def columns_count
        @columns_count ||= rounds.count + 5
      end

      def sections
        @sections ||= event.sections.order(:order).map do |section|
          Category.new(section, self, CompetitorsCollection)
        end
      end

      def jumps_for_total
        @jumps_for_total ||= event.number_of_results_for_total
      end

      def rounds
        @rounds ||= event.rounds.order(:number)
      end

      def to_partial_path
        'events/scoreboards/hungary_boogie'
      end

      private

      attr_reader :params
    end
  end
end
