module Tournaments
  class MatchesController < ApplicationController
    include TournamentScoped

    before_action :set_tournament, :authorize_action
    before_action :set_match, only: %i[edit update destroy]

    def edit
      respond_to do |format|
        format.turbo_stream
      end
    end

    def create
      @round = @tournament.rounds.find(params[:round_id])
      @match = @round.matches.new

      respond_to do |format|
        if @match.save
          format.turbo_stream { respond_with_scoreboard }
        else
          format.turbo_stream { respond_with_errors @match }
        end
      end
    end

    def update
      respond_to do |format|
        if @match.update(match_params)
          format.turbo_stream { respond_with_scoreboard }
        else
          format.turbo_stream { respond_with_errors @match }
        end
      end
    end

    def destroy
      respond_to do |format|
        if @match.destroy
          format.turbo_stream { respond_with_scoreboard }
        else
          format.turbo_stream { respond_with_errors @match }
        end
      end
    end

    private

    def set_match
      @match = @tournament.matches.find(params[:id])
    end

    def authorize_action
      authorize @tournament, :update?
    end

    def match_params
      params.require(:tournament_match).permit(
        :tournament_round_id,
        :start_time,
        :match_type,
        slots_attributes: {}
      )
    end
  end
end
