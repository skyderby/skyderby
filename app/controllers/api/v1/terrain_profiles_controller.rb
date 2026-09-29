module Api
  module V1
    class TerrainProfilesController < Api::ApplicationController
      def show
        @terrain_profile = TerrainProfile.includes(:place, :measurements).find(params[:id])
        respond_not_authorized unless @terrain_profile.viewable?
      end
    end
  end
end
