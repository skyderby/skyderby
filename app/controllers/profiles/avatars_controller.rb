module Profiles
  class AvatarsController < ApplicationController
    before_action :set_profile

    def new
      respond_to do |format|
        format.js
      end
    end

    def create
      authorize @profile, :update?

      @profile.update(avatar_params)
      @profile.userpic.reprocess!

      respond_to do |format|
        format.js
      end
    end

    private

    def set_profile
      @profile = Profile.find(params[:profile_id])
    end

    def avatar_params
      params.require(:profile).permit(
        :userpic,
        :crop_x,
        :crop_y,
        :crop_h,
        :crop_w
      )
    end
  end
end
