module Events
  module Scoreboards
    class HungaryBoogie
      attr_reader :sections,
                  :columns_count,
                  :display_raw_results,
                  :jumps_for_total

      def initialize(event, display_raw_results)
        @event = event
        @jumps_for_total = event.number_of_results_for_total
        @display_raw_results = display_raw_results

        @columns_count = @event.rounds.count + 4
        @sections = {}

        @event.sections.each do |section|
          @sections[section.id] = section_scoreboard(section) if section.id
        end
      end

      def template
        'events/scoreboards/hungary_boogie'
      end

      private

      def section_scoreboard(section)
        competitors_results = section.competitors.map do |competitor|
          CompetitorResult.new(competitor, jumps_for_total)
        end

        sort_results(competitors_results)
      end

      def sort_results(results)
        results.sort_by do |x|
          [-x.total_points,
           -x.event_tracks.size,
           -x.average_result,
           x.name]
        end
      end
    end
  end
end
