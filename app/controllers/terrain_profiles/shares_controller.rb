module TerrainProfiles
  class SharesController < ApplicationController
    before_action :set_terrain_profile

    def new
      @share = @terrain_profile.shares.new
    end

    def create
      @share = @terrain_profile.shares.new(share_params)

      if @share.save
        redirect_to terrain_profiles_path(profile: [@terrain_profile.id])
      else
        respond_with_errors @share
      end
    end

    private

    def set_terrain_profile
      @terrain_profile = TerrainProfile.find(params[:terrain_profile_id])

      respond_not_authorized unless @terrain_profile.shareable_with_users?
    end

    def share_params
      params.require(:terrain_profile_share).permit(:user_id)
    end
  end
end
