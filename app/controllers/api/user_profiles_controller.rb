module Api
  class UserProfilesController < ApplicationController
    before_action :set_profile, only: :update

    def index
      if params[:query] && params[:query][:term]
        @profiles = UserProfile
          .where('LOWER(name) LIKE LOWER(?)', "%#{params[:query][:term]}%")
          .order(:name)
      else
        @profiles = UserProfile.order(:name)
      end
    end

    def update
      if @profile.update profile_params
        @profile
      else
        render json: @profile.errors,
               status: :unprocessable_entity
      end
    end

    private

    def profile_params
      params.require(:user_profile).permit(:name, :userpic)
    end

    def set_profile
      @profile = UserProfile.find(params[:id])
    end
  end
end
