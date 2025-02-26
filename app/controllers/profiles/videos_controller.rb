class Profiles::VideosController < ApplicationController
  before_action :set_profile

  def index
    @videos =
      TrackVideo
      .includes(track: %i[pilot place suit])
      .where(track: @profile.tracks.accessible)
      .order(created_at: :desc)
  end

  private

  def set_profile
    @profile = Profile.find(params[:profile_id])
  end
end
