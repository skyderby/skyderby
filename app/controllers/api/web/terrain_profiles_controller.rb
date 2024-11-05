class Api::Web::TerrainProfilesController < Api::Web::ApplicationController
  def index
    @terrain_profiles = Place::JumpLine.includes(:place).all
  end

  def show
    @terrain_profile = Place::JumpLine.find(params[:id])
  end
end
