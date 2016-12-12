class Tracks::MapsController < ApplicationController
  load_resource :track
  before_action :authorize_track

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
end
