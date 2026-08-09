module TerrainProfiles
  class MeasurementsController < ApplicationController
    def index
      @terrain_profile = TerrainProfile.find(params[:terrain_profile_id])
      return respond_not_authorized unless @terrain_profile.viewable?

      @measurements = @terrain_profile.measurements.order(:altitude)
    end
  end
end
