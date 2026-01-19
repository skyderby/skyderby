module Profiles
  class AvatarsController < ApplicationController
    before_action :set_profile

    def new
      respond_to do |format|
        format.turbo_stream
      end
    end

    def create
      authorize @profile, :update?

      @profile.update(avatar_params)

      redirect_to profile_path(@profile)
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
