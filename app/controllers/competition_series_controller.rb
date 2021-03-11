class CompetitionSeriesController < ApplicationController
  def show
    @competition_series = CompetitionSeries.find(params[:id])
  end
end
