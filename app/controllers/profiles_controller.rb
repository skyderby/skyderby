# encoding: utf-8
class ProfilesController < ApplicationController
  before_action :set_profile, only: [:edit, :update]

  load_and_authorize_resource

  def index
    @profiles = Profile.includes(:user, :country).order(:name)
  end

  def show
    @profile = ProfileFacade.new(params, current_user)
  end

  def edit; end

  def update
    if @profile.update profile_params
      respond_to do |format|
        format.html { redirect_to @profile }
        format.json { @profile }
      end
    else
      respond_to do |format|
        format.html { redirect_to edit_profile_path(@profile) }
        format.json { render json: @profile.errors, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_profile
    @profile = Profile.find(params[:id])
  end

  def profile_params
    params.require(:profile).permit(:name, :userpic, :country_id)
  end
end
