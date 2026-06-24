module Tournaments
  class CompetitorsCopiesController < ApplicationController
    include TournamentScoped
    include Qualifications::RespondWithScoreboard

    before_action :authorize_tournament

    def new
      respond_to do |format|
        format.turbo_stream
      end
    end

    def create
      @tournament.copy_competitors_from!(Tournament.find(copy_params[:source_tournament_id]))

      respond_with_scoreboard
    end

    private

    def authorize_tournament
      authorize @tournament, :update?
    end

    def copy_params
      params.require(:competitor_copy).permit(:source_tournament_id)
    end
  end
end
