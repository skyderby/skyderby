module Events
  module Scoreboards
    class SpeedDistanceTime

      class CompetitorResult < SimpleDelegator
        attr_accessor :points_in_disciplines, :total_points
      end

      attr_reader :sections, :columns_count, :display_raw_results

      def initialize(event, display_raw_results)
        @event = event
        @display_raw_results = display_raw_results || false

        @columns_count = @event.rounds.count * 2 + @event.rounds_by_discipline.count + 4
        @sections = {}

        @event.sections.each do |section|
          @sections[section.id] = section_scoreboard(section) if section.id
        end
      end

      def template
        'events/scoreboards/speed_distance_time'
      end

      private

      def section_scoreboard(section)
        competitors_results =
          section.competitors.map do |competitor|
            competitor_result = CompetitorResult.new(competitor)
            competitor_result.points_in_disciplines =
              calculate_points_in_disciplines(competitor)

            competitor_result
          end

        competitors_results.each do |comp_result|
          comp_result.total_points =
            comp_result.points_in_disciplines
              .map { |k, v| v }
              .inject(0) { |sum, x| sum + x }
        end

        competitors_results.sort_by { |x| -x.total_points }
      end

      def calculate_points_in_disciplines(competitor)
        points = {}
        @event.rounds_by_discipline.each do |discipline, rounds|
          points[discipline] =
            competitor.event_tracks.select do |x|
              x.round_discipline == discipline
            end.inject(0) { |sum, x| sum + x.points(net: @display_raw_results) } / rounds.count
        end
        points
      end
    end
  end
end
