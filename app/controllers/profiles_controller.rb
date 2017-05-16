# encoding: utf-8
class ProfilesController < ApplicationController
  before_action :set_profile, only: [:show, :edit, :update, :destroy]

  def index
    authorize Profile
    @profiles = Profile.includes(:user, :country).order(:name)
  end

  def show
    authorize @profile
    @profile = ProfileFacade.new(params, current_user)
  end

  def edit
    authorize @profile
  end

  def update
    authorize @profile

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

  def destroy
    authorize @profile

    respond_to do |format|
      if @profile.destroy
        format.js
        format.html { redirect_to profiles_path }
      else
        format.html { render :show }
        format.js do
          render template: 'errors/ajax_errors',
                 locals: { errors: @profile.errors },
                 status: :unprocessable_entity
        end
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
