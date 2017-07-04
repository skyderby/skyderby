module Tournaments
  class RoundsController < ApplicationController
    before_action :set_tournament

    def create
      authorize @tournament, :update?

      @tournament_round = @tournament.rounds.new

      respond_to do |format|
        if @tournament_round.save
          format.js
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: @tournament_round.errors },
                   status: :unprocessable_entity
          end
        end
      end
    end

    def destroy
      authorize @tournament, :update?

      @tournament_round = @tournament.rounds.find(params[:id])

      respond_to do |format|
        if @tournament_round.destroy
          format.js
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: @tournament_round.errors },
                   status: :unprocessable_entity
          end
        end
      end
    end

    private

    def set_tournament
      @tournament = Tournament.find(params[:tournament_id])
    end
  end
end
