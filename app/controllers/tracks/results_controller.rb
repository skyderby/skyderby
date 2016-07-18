class Tracks::ResultsController < ApplicationController
  load_resource :track
  before_filter :authorize_track

  def index
  end

  private

  def authorize_track
    authorize! :show, @track 
  end
end
