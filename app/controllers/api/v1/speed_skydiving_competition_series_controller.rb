class Api::V1::SpeedSkydivingCompetitionSeriesController < Api::ApplicationController
  def show
    @event = SpeedSkydivingCompetitionSeries.find(params[:id])
  end
end
