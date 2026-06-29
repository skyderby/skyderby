class ProfilesController < ApplicationController
  before_action :set_profile, only: %i[edit update destroy]

  def index
    display_profiles =
      if index_params[:query].present?
        Profile.search(params[:query]).order(:name).limit(6)
      else
        profiles_with_video =
          Track.joins(:video, :pilot).select(:profile_id)
        Profile.where(id: profiles_with_video).order('random()').limit(6)
      end

    @profiles =
      display_profiles
      .select(
        'profiles.*',
        "COUNT(tracks.id) FILTER (where tracks.kind = #{Track.kinds[:skydive]}) as skydive_count",
        "COUNT(tracks.id) FILTER (where tracks.kind = #{Track.kinds[:base]}) as base_count",
        "COUNT(tracks.id) FILTER (where tracks.kind = #{Track.kinds[:speed_skydiving]}) as speed_count"
      )
      .left_joins(:tracks)
      .group('profiles.id')
      .includes(:country, :owner, :badges, :contributions)
  end

  def show
    profile = Profile.includes(:badges, :country).find(params[:id])

    @profile = Profiles::Dashboard.new(
      profile,
      user: Current.user,
      mode: params[:mode],
      rankings_gender: params[:rankings_gender]
    )

    respond_to do |format|
      format.html
    end
  end

  def edit
    return respond_not_authorized unless @profile.editable?

    respond_to do |format|
      format.html
    end
  end

  def update
    return respond_not_authorized unless @profile.editable?

    if @profile.update profile_params
      respond_to do |format|
        format.html { redirect_to @profile }
        format.json { @profile }
      end
    else
      respond_to do |format|
        format.html { redirect_to edit_profile_path(@profile) }
        format.json { render json: @profile.errors, status: :unprocessable_content }
      end
    end
  end

  def destroy
    return respond_not_authorized unless @profile.deletable?

    respond_to do |format|
      if @profile.destroy
        format.html { redirect_to profiles_path }
        format.turbo_stream { redirect_to profiles_path }
      else
        format.html { render :show }
        format.turbo_stream { respond_with_errors @profile }
      end
    end
  end

  private

  def set_profile
    @profile = Profile.find(params[:id])
  end

  def profile_params
    params.require(:profile).permit(:name, :userpic, :country_id, :gender)
  end

  def index_params = params.permit(:query)
  helper_method :index_params
end
