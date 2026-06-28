module Tournaments
  class StatusesController < ApplicationController
    before_action :set_tournament

    def update
      authorize @tournament, :update?

      @tournament.update(status_params)
      redirect_back_or_to @tournament
    end

    private

    def set_tournament
      @tournament = Tournament.find(params[:tournament_id])
    end

    def status_params = params.require(:tournament).permit(:status)
  end
end
