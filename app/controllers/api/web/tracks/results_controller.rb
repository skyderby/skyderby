class Api::Web::Tracks::ResultsController < Api::Web::ApplicationController
  def show
    authorize track
  end

  private

  def track
    @track ||= Track.find(params[:track_id])
  end
end
