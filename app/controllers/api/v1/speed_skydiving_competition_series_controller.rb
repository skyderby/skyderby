class Api::V1::SpeedSkydivingCompetitionSeriesController < Api::ApplicationController
  def show
    @event = authorize SpeedSkydivingCompetitionSeries.includes(competitions: { place: :country })
                                                      .find(params[:id])
  end
end
