module Tournaments
  module Matches
    class MapsController < ApplicationController
      include TournamentScoped

      def show
        @match = @tournament.matches.find(params[:match_id])
        @match_map = MatchMap.new @match

        respond_to do |format|
          format.html
          format.turbo_stream
        end
      end
    end
  end
end
