class Api::V1::PerformanceCompetitions::CompetitorsController < ApplicationController
  def index
    event = Event.speed_distance_time.find(params[:performance_competition_id])

    authorize event, :show?

    @competitors = event.competitors
  end
end
