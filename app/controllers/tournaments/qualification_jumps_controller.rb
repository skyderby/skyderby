module Tournaments
  class QualificationJumpsController < ApplicationController
    include ChartParams

    before_action :set_tournament
    before_action :authorize_tournament, except: :show
    before_action :set_qualification_jump, only: %i[show edit update destroy]

    def new
      @round = @tournament.qualification_rounds.find(qualification_jump_params[:qualification_round_id])
      @qualification_jump = @round.qualification_jumps.new(qualification_jump_params)
    end

    def create
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

    def show
      respond_to do |format|
        format.html { redirect_to @qualification_jump.track }
        format.js do 
          @track_presenter = Tracks::BaseRaceTrack.new(
            @qualification_jump,
            ChartsPreferences.new(session)
          )
        end
      end
    end

    def edit; end

    def update
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

    def destroy
      respond_to do |format|
        if @qualification_jump.destroy
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

    def authorize_tournament
      authorize @tournament, :update?
    end

    def set_qualification_jump
      @qualification_jump = @tournament.qualification_jumps.find(params[:id])
    end

    def qualification_jump_params
      params.require(:qualification_jump).permit(
        :qualification_round_id,
        :tournament_competitor_id,
        :start_time,
        :result,
        :canopy_time,
        :track_id,
        :track_from,
        track_attributes: [
          :file,
          :profile_id,
          :place_id,
          :suit_id
        ]
      )
    end

    def show_params
      params.permit(:charts_mode, :charts_units)
    end
    helper_method :show_params
  end
end
