class Tracks::MapsController < ApplicationController
  before_action :set_track, :authorize_track

  def show
    respond_to do |format|
      format.html {}
      format.json { @track_data = Skyderby::Tracks::MapsData.new(@track) }
    end
  end

  private

  def authorize_track
    authorize! :show, @track
  end

  def set_track
    @track = Track.includes(
      :video,
      { wingsuit: :manufacturer },
      { place: :country }
    ).find(params[:track_id])
  end
end
