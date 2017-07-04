module Tournaments
  class QualificationRoundsController < ApplicationController
    before_action :set_tournament

    def create
      authorize @tournament, :update?

      @round = @tournament.qualification_rounds.new

      respond_to do |format|
        if @round.save
          format.js { render template: 'tournaments/qualifications/update_scoreboard' }
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: @round.errors },
                   status: :unprocessable_entity
          end
        end
      end
    end

    def destroy
      authorize @tournament, :update?

      @round = @tournament.qualification_rounds.find(params[:id])

      respond_to do |format|
        if @round.destroy
          format.js { render template: 'tournaments/qualifications/update_scoreboard' }
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: @round.errors },
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
