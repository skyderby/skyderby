module Tournaments
  class QualificationRoundsController < ApplicationController
    def create
      @tournament = Tournament.find(params[:tournament_id])
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
  end
end
