class SpeedSkydivingCompetitionsController < ApplicationController
  def show
    @event = SpeedSkydivingCompetition.find(params[:id])
  end
end
