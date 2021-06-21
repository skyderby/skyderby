class Api::V1::PerformanceCompetitions::ReferencePointsController < ApplicationController
  def index
    event = Event.speed_distance_time.find(params[:performance_competition_id])

    authorize event, :show?

    @reference_points = event.reference_points
  end
end
