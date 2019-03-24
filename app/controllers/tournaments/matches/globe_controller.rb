module Tournaments
  module Matches
    class GlobeController < ApplicationController
      def show
        @tournament = Tournament.find(params[:tournament_id])
        @match = @tournament.matches.find(params[:match_id])
        @match_map = MatchGlobe.new @match
      end
    end
  end
end
