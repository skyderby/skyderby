module Tournaments
  module Matches
    class GlobeController < ApplicationController
      def show
        @match = TournamentMatch.find(params[:match_id])
        @match_map = MatchGlobe.new @match
      end
    end
  end
end
