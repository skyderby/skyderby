class Api::V1::PerformanceCompetitions::StandingsController < ApplicationController
  def index
    event = Event.speed_distance_time.find(params[:performance_competition_id])

    authorize event, :show?

    @standings = PerformanceCompetition::Scoreboard.new(event, scoreboard_params)
  end

  private

  def scoreboard_params
    params.permit \
      :display_raw_results,
      :omit_penalties,
      :split_by_categories
  end
end
