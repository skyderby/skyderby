module Tournaments
  module Matches
    class GlobeController < ApplicationController
      load_resource :tournament

      def show
        @match_map = MatchGlobe.new TournamentMatch.find(params[:match_id])
      end
    end
  end
end
