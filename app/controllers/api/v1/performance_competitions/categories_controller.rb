class Api::V1::PerformanceCompetitions::CategoriesController < ApplicationController
  def index
    event = Event.speed_distance_time.find(params[:performance_competition_id])

    authorize event, :show?

    @categories = event.sections
  end
end
