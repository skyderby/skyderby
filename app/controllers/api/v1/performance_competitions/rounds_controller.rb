class Api::V1::PerformanceCompetitions::RoundsController < ApplicationController
  def index
    event = Event.speed_distance_time.find(params[:performance_competition_id])

    authorize event, :show?

    @rounds = event.rounds.order(:number, :created_at)
  end
end
