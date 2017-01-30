module Tournaments
  module Matches
    class MapsController < ApplicationController
      load_resource :tournament

      def show
        @match_map = MatchMap.new TournamentMatch.find(params[:match_id])
      end
    end
  end
end
