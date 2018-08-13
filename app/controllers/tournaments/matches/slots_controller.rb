module Tournaments
  module Matches
    class SlotsController < ApplicationController
      before_action :set_tournament, :set_match

      def show
        @slot = @match.slots.find(params[:id])

        respond_to do |format|
          format.html { redirect_to @tournament_match_competitor.track }
          format.js do
            @track_presenter = Tracks::BaseRaceTrackView.new(
              @slot,
              ChartsPreferences.new(session)
            )
          end
        end
      end

      private

      def set_tournament
        @tournament = Tournament.find(params[:tournament_id])
      end

      def set_match
        @match = @tournament.matches.find(params[:match_id])
      end

      def tournament_match_competitor_params
        params.require(:tournament_match_competitor).permit(
          :tournament_match_id,
          :tournament_competitor_id,
          :track_id,
          :result,
          :is_winner,
          :is_disqualified,
          :is_lucky_looser,
          :notes,
          :earn_medal
        )
      end

      def show_params
        params.permit(:charts_mode, :charts_units)
      end
      helper_method :show_params
    end
  end
end
