module Tournaments
  module Matches
    class MapsController < ApplicationController
      def show
        @match_map = MatchMap.new TournamentMatch.find(params[:match_id])
      end
    end
  end
end
