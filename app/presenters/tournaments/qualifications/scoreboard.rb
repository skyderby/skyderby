module Tournaments
  module Qualifications
    class Scoreboard
      def initialize(tournament)
        @tournament = tournament
      end

      def rounds
        @rounds ||= tournament.qualification_rounds
      end

      def competitors
        @competitors ||= CompetitorsCollection.new(tournament.competitors, self)
      end

      def results
        @results ||= tournament.qualification_jumps.all
      end

      private

      attr_reader :tournament
    end
  end
end
