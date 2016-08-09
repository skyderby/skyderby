# encoding: utf-8
class ProfilesController < ApplicationController
  before_action :set_profile, only: [:edit, :update]

  load_and_authorize_resource
   skip_authorize_resource only: :index

  def index
    authorize!(:index, Profile) if request.format == :html

    @profiles = Profile.includes(:user, :country).order(:name)

    if params[:query]
      @profiles = @profiles.joins(:user) if params[:query][:only_registered]
      @profiles = @profiles.search(params[:query][:term]) if params[:query][:term]
    end
  end

  def show
    @profile = Profile.includes(
      :badges,
      tracks: [
        :distance,
        :speed,
        :time,
        :video,
        {wingsuit: :manufacturer},
        {place: :country}
      ]
    ).find(params[:id])
  end

  def edit
  end

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
