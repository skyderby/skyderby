module Api
  class RoundsController < ApplicationController
    before_action :set_round, only: [:update, :destroy]

    def create
      @round = Round.new round_params
      if @round.save
        @round
      else
        render json: @round.errors,
               status: :unprocessable_entity
      end
    end

    def update
      if @round.update round_params
        @round
      else
        render json: @round.errors,
               status: :unprocessable_entity
      end
    end

    def destroy
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
