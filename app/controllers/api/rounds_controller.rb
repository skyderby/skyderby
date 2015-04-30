module Api
  class RoundsController < ApplicationController
    before_action :set_round, only: [:update, :destroy]

    def create
      @round = Round.new round_params
      authorize! :update, @round.event

      if @round.save
        @round
      else
        render json: @round.errors, status: :unprocessable_entity
      end
    end

    def update
      authorize! :update, @round.event

      if @round.update round_params
        @round
      else
        render json: @round.errors, status: :unprocessable_entity
      end
    end

    def destroy
      authorize! :update, @round.event

      @round.destroy
      head :no_content
    end

    private

    def set_round
      @round = Round.find(params[:id])
    end

    def round_params
      params.require(:round).permit(:name, :discipline, :event_id)
    end
  end
end
