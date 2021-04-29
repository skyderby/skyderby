class Api::V1::PerformanceCompetitionsController < ApplicationController
  def show
    @event = authorize Event.speed_distance_time.find(params[:id])
  end
end
