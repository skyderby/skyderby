module Api
  module V1
    module TerrainProfiles
      class SharesController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :write }, only: %i[create destroy]
        before_action :require_registered_user!
        before_action :set_terrain_profile

        def index
          @shares = @terrain_profile.shares.includes(user: :profile).order(:created_at)
        end

        def create
          @share = @terrain_profile.shares.new(user_id: params[:user_id])

          if @share.save
            render :show, status: :created
          else
            render_errors @share.errors.full_messages, status: :unprocessable_content
          end
        end

        def destroy
          @terrain_profile.shares.find_by!(user_id: params[:id]).destroy
          head :no_content
        end

        private

        def set_terrain_profile
          @terrain_profile = TerrainProfile.find(params[:terrain_profile_id])
          respond_not_authorized unless @terrain_profile.shareable_with_users?(current_user)
        end
      end
    end
  end
end
