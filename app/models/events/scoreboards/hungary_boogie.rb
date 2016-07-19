module Events
  module Scoreboards
    class HungaryBoogie

      class CompetitorResult < SimpleDelegator
        attr_accessor :total_points
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
        competitors_results = 
          section.competitors.map do |competitor|
            competitor_result = CompetitorResult.new(competitor)
            competitor_result.total_points = total_points(competitor.event_tracks)
            competitor_result
          end

        competitors_results.sort_by { |x| -(x.total_points || 0) }
      end

      def total_points(competitor_tracks)
        result_tracks = competitor_tracks.reject(&:is_disqualified)
        return if result_tracks.size < 3

        result_tracks.map { |x| x.result }
                         .sort_by { |x| -x }
                         .first(3)
                         .sum / 3
      end
    end
  end
end

