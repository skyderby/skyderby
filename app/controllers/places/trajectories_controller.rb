class Places::TrajectoriesController < ApplicationController
  def show
    @place = Place.find(params[:place_id])

    @trajectories = @place.recent_trajectories
  end
end
