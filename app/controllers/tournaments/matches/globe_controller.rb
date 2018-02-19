module Tournaments
  module Matches
    class GlobeController < ApplicationController
      def show
        @match = tournament.matches.find(params[:match_id])
        @match_map = MatchGlobe.new @match
      end

      private

      def tournament
        Tournament.find(params[:tournament_id])
      end
    end
  end
end
