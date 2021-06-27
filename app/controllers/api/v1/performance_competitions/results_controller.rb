class Api::V1::PerformanceCompetitions::ResultsController < ApplicationController
  def index
    event = Event.speed_distance_time.find(params[:performance_competition_id])

    authorize event, :show?

    @results = event.results.with_exit_details
  end
end
