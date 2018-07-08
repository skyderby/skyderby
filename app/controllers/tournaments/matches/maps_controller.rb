module Tournaments
  module Matches
    class MapsController < ApplicationController
      include TournamentScoped

      def show
        @match_map = MatchMap.new @tournament.matches.find(params[:match_id])
      end
    end
  end
end
