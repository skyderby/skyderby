# encoding: utf-8
class UserProfileController < ApplicationController
  before_action :set_user, only: [:update]

  def show
    @profile = UserProfile.find(params[:id]) 
  end

  def update
    @profile = @user.user_profile
    @profile.update profile_params
    redirect_to user_profile_path(@profile)
  end

  private

  def set_user
    @user = User.find(params[:user_id])
  end

  def profile_params
    params.require(:user_profile).permit(:name, :userpic)
  end

end
