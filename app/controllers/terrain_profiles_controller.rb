class TerrainProfilesController < ApplicationController
  before_action :set_terrain_profile, only: %i[edit update]

  def index
    @index = TerrainProfiles::Index.new(user: Current.user)
  end

  def new
    return respond_not_authorized unless TerrainProfile.creatable?

    @terrain_profile = TerrainProfile.new
  end

  def edit; end

  def create
    return respond_not_authorized unless TerrainProfile.creatable?

    @terrain_profile = TerrainProfile.new(terrain_profile_params)
    @terrain_profile.user = new_profile_owner

    if @terrain_profile.save
      redirect_to terrain_profiles_path(profile: [@terrain_profile.id])
    else
      respond_with_errors @terrain_profile
    end
  end

  def update
    if @terrain_profile.update(terrain_profile_params)
      redirect_to terrain_profiles_path(profile: [@terrain_profile.id])
    else
      respond_with_errors @terrain_profile
    end
  end

  def destroy
    @terrain_profile = TerrainProfile.find(params[:id])
    share = @terrain_profile.shares.find_by(user_id: Current.user&.id)

    if @terrain_profile.deletable?
      @terrain_profile.destroy
    elsif share
      share.destroy
    else
      return respond_not_authorized
    end

    redirect_to terrain_profiles_path
  end

  private

  def set_terrain_profile
    @terrain_profile = TerrainProfile.find(params[:id])

    respond_not_authorized unless @terrain_profile.editable?
  end

  def new_profile_owner
    return nil if @terrain_profile.ownership == 'shared' && TerrainProfile.shareable_by?

    Current.user
  end

  def terrain_profile_params
    params
      .require(:terrain_profile)
      .permit(:name, :place_id, :track_id, :published, :measurements_text, :ownership)
  end
end
