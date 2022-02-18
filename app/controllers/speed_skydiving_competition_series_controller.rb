class SpeedSkydivingCompetitionSeriesController < ApplicationController
  def show
    @event = SpeedSkydivingCompetitionSeries.find(params[:id])
  end
end
