# encoding: utf-8
class UserProfileController < ApplicationController
  before_action :set_user, only: [:show, :edit, :update]

  def update
    @profile = @user.user_profile
    @profile.update profile_params
    redirect_to @user
  end

  private

  def set_user
    @user = User.find(params[:user_id])
  end

  def profile_params
    params.require(:user_profile).permit(:first_name, :last_name,
                                         :jumps_total, :jumps_wingsuit,
                                         :jumps_last_year, :userpic)
  end

end
