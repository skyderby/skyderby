module Tournaments
  class QualificationJumpsController < ApplicationController
    before_action :set_tournament

    def new
      authorize @tournament, :update?
      @round = @tournament.qualification_rounds.find(qualification_jump_params[:qualification_round_id])
      @qualification_jump = @round.qualification_jumps.new(qualification_jump_params)
    end

    def create
      authorize @tournament, :update?

      @round = @tournament.qualification_rounds.find(qualification_jump_params[:qualification_round_id])
      @qualification_jump = @round.qualification_jumps.new(qualification_jump_params)

      respond_to do |format|
        if @qualification_jump.save
          format.js { render :edit }
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: @qualification_jump.errors },
                   status: :unprocessable_entity
          end
        end
      end
    end

    def edit
      authorize @tournament, :update?

      @qualification_jump = @tournament.qualification_jumps.find(params[:id])
    end

    def update
      authorize @tournament, :update?

      @qualification_jump = @tournament.qualification_jumps.find(params[:id])

      respond_to do |format|
        if @qualification_jump.update(qualification_jump_params)
          format.js { render template: 'tournaments/qualifications/update_scoreboard' }
        else
          format.js do
            render template: 'errors/ajax_errors',
                   locals: { errors: @qualification_jump.errors },
                   status: :unprocessable_entity
          end
        end
      end
    end

    private

    def set_tournament
      @tournament = Tournament.find(params[:tournament_id])
    end

    def qualification_jump_params
      params.require(:qualification_jump).permit(
        :qualification_round_id,
        :tournament_competitor_id,
        :start_time,
        :result,
        track_attributes: [
          :file,
          :profile_id,
          :place_id,
          :wingsuit_id
        ]
      )
    end
  end
end
