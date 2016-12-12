class Tracks::DownloadsController < ApplicationController
  load_resource :track
  before_action :authorize_track

  def show
    track_file = @track.track_file
    file_path = Paperclip.io_adapters.for(track_file.file).path
    send_file file_path, filename: track_file.file_file_name
  end

  private

  def authorize_track
    authorize! :update, @track
  end
end
