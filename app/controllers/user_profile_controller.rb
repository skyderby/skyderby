# encoding: utf-8
class UserProfileController < ApplicationController
  def show
    @profile = UserProfile
                .includes(:badges)
                .includes(:tracks)
                .includes(tracks: :distance)
                .includes(tracks: :speed)
                .includes(tracks: :time)
                .includes(tracks: :wingsuit)
                .includes(tracks: {wingsuit: :manufacturer})
                .find(params[:id]) 
  end

  def update
    @profile = UserProfile.find(params[:id])
    @profile.update profile_params
    redirect_to user_profile_path(@profile)
  end

  private

  def profile_params
    params.require(:user_profile).permit(:name, :userpic)
  end
end
