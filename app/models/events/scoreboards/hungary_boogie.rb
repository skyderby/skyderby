module Events
  module Scoreboards
    class HungaryBoogie

      class CompetitorResult < SimpleDelegator
        def total_points
          return 0 unless counted_results
          @total_points ||= counted_results.map { |x| x.result }.sum.to_f / 3
        end

        def counted_results
          @counted_results ||= begin
            result_tracks = event_tracks.reject(&:is_disqualified)
            result_tracks.sort_by { |x| -x.result }.first(3) if result_tracks.size >= 3
          end
        end

        def average_result
           results_values = event_tracks.reject(&:is_disqualified).map { |x| x.result }
           return 0 if results_values.blank?
           results_values.inject(0.0) { |sum, el| sum + el } / results_values.size
        end
      end

      attr_reader :sections, :columns_count, :display_raw_results

      def initialize(event, display_raw_results)
        @event = event
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
          competitor_result = CompetitorResult.new(competitor)
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
