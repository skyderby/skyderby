class Places::VideosController < ApplicationController
  before_action :set_place

  def index
    @videos =
      TrackVideo
      .includes(track: %i[pilot place suit])
      .where(track: @place.tracks.accessible)
      .order(created_at: :desc)
  end

  private

  def set_place
    @place = Place.find(params[:place_id])
  end
end
