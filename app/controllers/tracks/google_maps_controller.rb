class Tracks::GoogleMapsController < ApplicationController
  load_resource :track
  before_filter :authorize_track

  def index
    respond_to do |format|
      format.html {}
      format.json { @track_data = Skyderby::Tracks::MapsData.new(@track) }
    end
  end

  private

  def authorize_track
    authorize! :show, @track 
  end
end
