class Api::Web::PerformanceCompetitions::TeamStandingsController < Api::Web::ApplicationController
  def show
    event = Event.speed_distance_time.find(params[:performance_competition_id])

    authorize event, :show?

    @standings = PerformanceCompetition::TeamScoreboard.new(event)
  end
end
