module Tournaments
  module Qualifications
    class Competitor < SimpleDelegator
      def initialize(record, scoreboard)
        @record = record
        @scoreboard = scoreboard

        super(@record)
      end

      def results
        scoreboard.results.select { |result| result.competitor_id == id }
      end

      def result_in_round(round)
        results.find { |result| result.round == round }
      end

      def best_result
        results.select(&:result).min_by(&:result)&.result
      end

      private

      attr_reader :scoreboard
    end
  end
end
