module Tournaments
  module Qualifications
    class ResultsController < ApplicationController
      include ChartParams, TournamentScoped
      include RespondWithScoreboard

      before_action :set_tournament
      before_action :set_round, only: %i[new create]
      before_action :set_result, only: %i[show edit update destroy]

      def new
        authorize @tournament, :update?

        @result = @round.qualification_jumps.new(new_result_params)
      end

      def create
        @result = @round.qualification_jumps.new(new_result_params)

        if @result.save
          respond_to do |format|
            format.js { render :edit }
          end
        else
          respond_with_errors(@result.errors)
        end
      end

      def show
        authorize @tournament, :show?

        @track_presenter = Tracks::BaseRaceTrackView.new \
          @result,
          ChartsPreferences.new(session)

        respond_to do |format|
          format.html
          format.js { render :edit if @result.result.blank? }
        end
      end

      def edit
        authorize @tournament, :update?
      end

      def update
        authorize @tournament, :update?

        if @result.update(update_result_params)
          respond_with_scoreboard
        else
          respond_with_errors(@result.errors)
        end
      end

      def destroy
        authorize @tournament, :update?

        if @result.destroy
          respond_with_scoreboard
        else
          respond_with_errors(@result.errors)
        end
      end

      private

      def set_round
        @round = @tournament.qualification_rounds.find(new_result_params[:qualification_round_id])
      end

      def set_result
        @result = @tournament.qualification_jumps.find(params[:id])
      end

      def new_result_params
        params.require(:result).permit \
          :qualification_round_id,
          :competitor_id,
          :track_id,
          :track_from,
          track_attributes: [
            :file,
            :profile_id,
            :place_id,
            :suit_id
          ]
      end

      def update_result_params
        params.require(:result).permit \
          :start_time,
          :result,
          :canopy_time
      end

      def show_params
        params.permit(:charts_mode, :charts_units)
      end
      helper_method :show_params
    end
  end
end
