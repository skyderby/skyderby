class CompetitionSeriesController < ApplicationController
  before_action :set_competition_series, only: :show

  def show
    @scoreboard = CompetitionSeries::Scoreboard.new @competition_series, scoreboard_params
  end

  private

  def set_competition_series
    @competition_series = CompetitionSeries.find(params[:id])
  end

  def scoreboard_params
    params.permit \
      :display_raw_results,
      :omit_penalties,
      :split_by_categories
  end
end
