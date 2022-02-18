class PerformanceCompetitionSeriesController < ApplicationController
  before_action :set_competition_series, only: :show

  def show
    @scoreboard = PerformanceCompetitionSeries::Scoreboard.new @competition_series, scoreboard_params

    respond_to do |format|
      format.html
    end
  end

  private

  def set_competition_series
    @competition_series = PerformanceCompetitionSeries.find(params[:id])
  end

  def scoreboard_params
    params.permit \
      :display_raw_results,
      :omit_penalties,
      :split_by_categories
  end
end
