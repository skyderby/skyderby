module Api
  module V1
    module Places
      class TrajectoriesController < Api::ApplicationController
        def show
          @trajectories = Place.find(params[:place_id]).recent_trajectories
        end
      end
    end
  end
end
