module Api
  module V1
    class TerrainProfilesController < Api::ApplicationController
      def index
        @terrain_profiles = Place::JumpLine.all
      end
    end
  end
end
