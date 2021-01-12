module Tournaments
  module Qualifications
    class CompetitorsCollection
      include Enumerable
      delegate :each, to: :competitors

      def initialize(tournament_competitors, scoreboard)
        @tournament_competitors = tournament_competitors
        @scoreboard = scoreboard
      end

      private

      attr_reader :tournament_competitors, :scoreboard

      def competitors
        @competitors =
          tournament_competitors
          .then { |collection| map_competitors(collection) }
          .then { |collection| sort_competitors(collection) }
      end

      def map_competitors(collection)
        collection.map do |competitor|
          Tournaments::Qualifications::Competitor.new(competitor, scoreboard)
        end
      end

      def sort_competitors(collection)
        collection.sort_by do |competitor|
          [
            competitor.is_disqualified ? 1 : 0,
            competitor.best_result.present? ? 0 : 1,
            competitor.best_result.to_f,
            competitor.name
          ]
        end
      end
    end
  end
end
