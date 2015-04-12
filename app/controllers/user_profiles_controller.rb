# encoding: utf-8
class UserProfilesController < ApplicationController
  before_action :set_profile, only: [:edit, :update]
  
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
    authorize! :read, @profile
  end

  def edit
    authorize! :update, @profile
  end

  def update
    authorize! :update, @profile

    @profile.update profile_params
    redirect_to user_profile_path(@profile)
  end

  private
  def set_profile
    @profile = UserProfile.find(params[:id])
  end

  def profile_params
    params.require(:user_profile).permit(:name, :userpic)
  end
end
