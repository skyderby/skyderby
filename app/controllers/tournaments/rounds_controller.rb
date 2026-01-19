module Tournaments
  class RoundsController < ApplicationController
    before_action :set_tournament

    def create
      authorize @tournament, :update?

      @tournament_round = @tournament.rounds.new

      respond_to do |format|
        if @tournament_round.save
          format.turbo_stream { render template: 'tournaments/scoreboard' }
        else
          format.turbo_stream { respond_with_errors @tournament_round }
        end
      end
    end

    def destroy
      authorize @tournament, :update?

      @tournament_round = @tournament.rounds.find(params[:id])

      respond_to do |format|
        if @tournament_round.destroy
          format.turbo_stream { render template: 'tournaments/scoreboard' }
        else
          format.turbo_stream { respond_with_errors @tournament_round }
        end
      end
    end

    private

    def set_tournament
      @tournament = Tournament.find(params[:tournament_id])
    end
  end
end
