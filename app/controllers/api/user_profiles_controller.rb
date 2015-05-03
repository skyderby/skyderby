module Api
  class UserProfilesController < ApplicationController
    before_action :set_profile, only: :update

    def index
      @profiles = UserProfile.order(:name)

      if params[:query] 
        @profiles = @profiles.joins(:user) if params[:query][:only_registered]
        @profiles = @profiles.search(params[:query][:term]) if params[:query][:term]
      end
    end

    def update
      if @profile.update profile_params
        @profile
      else
        render json: @profile.errors, status: :unprocessable_entity
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
