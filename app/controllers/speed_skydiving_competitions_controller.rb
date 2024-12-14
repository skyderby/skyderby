class SpeedSkydivingCompetitionsController < ApplicationController
  def show
    @event = SpeedSkydivingCompetition.includes(:categories, :competitors, :results).find(params[:id])

    respond_not_authorized unless @event.viewable?
  end
end
