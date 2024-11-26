class SpeedSkydivingCompetitionsController < ApplicationController
  def show
    @event = SpeedSkydivingCompetition.includes(:categories, :competitors, :results).find(params[:id])
  end
end
