module Events
  module Scoreboards
    class SpeedDistanceTime
      include Events::Scoreboards::Results

      attr_reader :event

      delegate :adjust_to_wind?, :split_by_categories?, to: :params
      delegate :wind_cancellation, to: :event

      def initialize(event, params)
        @event = event
        @params = params
      end

      def columns_count
        @columns_count ||= (rounds.count * 2) + rounds_by_discipline.count + 4
      end

      def display_raw_results?
        !adjust_to_wind?
      end

      def sections
        @sections ||=
          if split_by_categories?
            event.sections.order(:order).map do |section|
              Category.new(section, self, CompetitorsCollection)
            end
          else
            [OpenCategory.new(self, CompetitorsCollection)]
          end
      end

      def rounds
        @rounds ||= event.rounds.order(:number, :created_at)
      end

      def rounds_by_discipline
        @rounds_by_discipline ||= rounds.group_by(&:discipline)
      end

      def to_partial_path
        'events/scoreboards/speed_distance_time'
      end

      private

      attr_reader :params
    end
  end
end
