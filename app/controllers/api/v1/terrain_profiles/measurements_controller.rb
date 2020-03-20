module Api
  module V1
    module TerrainProfiles
      class MeasurementsController < Api::ApplicationController
        def show
          terrain_profile = Place::JumpLine.includes(:measurements).find(params[:terrain_profile_id])
          @measurements = terrain_profile.measurements

          fresh_when terrain_profile

          respond_to do |format|
            format.json
          end
        end
      end
    end
  end
end
