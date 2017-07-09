module Tournaments
  class MatchesController < ApplicationController
    before_action :set_tournament, :authorize_action
    before_action :set_tournament_match, only: [:show, :edit, :update, :destroy]

    def edit; end

    def create
      @tournament_round = TournamentRound.find(params[:round_id])
      @tournament_match = @tournament_round.matches.new

      respond_to do |format|
        if @tournament_match.save
          format.js
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: @tournament_match.errors },
                   status: :unprocessable_entity
          end
        end
      end
    end

    def update
      respond_to do |format|
        if @tournament_match.update(tournament_match_params)
          format.js
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: @tournament_match.errors },
                   status: :unprocessable_entity
          end
        end
      end
    end

    def destroy
      respond_to do |format|
        if @tournament_match.destroy
          format.js
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: @tournament_match.errors },
                   status: :unprocessable_entity
          end
        end
      end
    end

    private

    def set_tournament
      @tournament = Tournament.find(params[:tournament_id])
    end

    def set_tournament_match
      @tournament_match = TournamentMatch.find(params[:id])
    end

    def authorize_action
      authorize @tournament, :update?
    end

    def tournament_match_params
      params.require(:tournament_match).permit(
        :tournament_round_id,
        :start_time,
        :match_type
      )
    end
  end
end
